import { WorkoutSession, WorkoutSummaryStats, RepEvent, FormFeedback } from '../types/workout';
import { Achievement, DailyActivity, MonthlyStats, PersonalBest, UserProfile } from '../types/analytics';
import { ExerciseType } from '../types/exercise';
import { AuthUser, authService } from './authService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { WorkoutSessionInsert, Json } from '../types/database';

const KEYS = {
  USER_PROFILE: 'gymbuddy_user_profile',
  WORKOUT_SESSIONS: 'gymbuddy_workout_sessions',
  PERSONAL_BESTS: 'gymbuddy_personal_bests',
  ACHIEVEMENTS: 'gymbuddy_achievements',
  MONTHLY_STATS: 'gymbuddy_monthly_stats',
  SUMMARY_STATS: 'gymbuddy_summary_stats',
};

class StorageService {
  private listeners: Array<() => void> = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.warn('Storage listener error:', e);
      }
    }
  }

  private getActiveUserId(overrideUserId?: string): string {
    if (overrideUserId) return overrideUserId;
    const user = authService.getCurrentUser();
    return user?.id || 'guest';
  }

  private getUserSessionsKey(userId?: string): string {
    const uid = this.getActiveUserId(userId);
    return `${KEYS.WORKOUT_SESSIONS}_${uid}`;
  }

  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  public getWorkoutSessions(userId?: string): WorkoutSession[] {
    const userKey = this.getUserSessionsKey(userId);
    const userSessions = this.get<WorkoutSession[]>(userKey, []);
    
    // If no user-specific sessions found and user is guest, check legacy global key
    if (userSessions.length === 0 && this.getActiveUserId(userId) === 'guest') {
      return this.get<WorkoutSession[]>(KEYS.WORKOUT_SESSIONS, []);
    }
    
    return userSessions;
  }

  public getSessionById(id: string, userId?: string): WorkoutSession | undefined {
    const sessions = this.getWorkoutSessions(userId);
    return sessions.find((s) => s.id === id);
  }

  public getPersonalBests(userId?: string): Record<ExerciseType, PersonalBest | null> {
    const sessions = this.getWorkoutSessions(userId);
    const pbs: Record<ExerciseType, PersonalBest | null> = {
      pushups: null,
      situps: null,
      squats: null,
      pullups: null,
    };

    for (const session of sessions) {
      const reps = typeof session.validReps === 'number' ? session.validReps : (session.totalReps || session.repsHistory?.length || 0);
      if (reps > 0) {
        const exId = session.exerciseId as ExerciseType;
        const existing = pbs[exId];
        if (!existing || reps > existing.maxReps) {
          pbs[exId] = {
            exerciseId: exId,
            exerciseName: session.exerciseName,
            maxReps: reps,
            bestSessionDuration: session.durationSeconds || 0,
            bestFormScore: session.averageFormScore || 0,
            achievedAt: new Date(session.endTime || session.startTime || Date.now()).toISOString(),
          };
        }
      }
    }

    return pbs;
  }

  public calculateStreaks(sessions: WorkoutSession[]): { currentStreak: number; longestStreak: number } {
    const validSessions = sessions.filter((s) => {
      const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
      return reps > 0 || (s.durationSeconds && s.durationSeconds >= 10);
    });

    if (validSessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Group into unique local calendar date strings: 'YYYY-MM-DD'
    const dateSet = new Set<string>();
    for (const s of validSessions) {
      const ts = s.endTime || s.startTime;
      if (!ts) continue;
      const d = new Date(ts);
      if (isNaN(d.getTime())) continue;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dateSet.add(dateStr);
    }

    const sortedDates = Array.from(dateSet).sort();
    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate all-time longest streak
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const [year, month, day] = dStr.split('-').map(Number);
      const currDate = new Date(year, month - 1, day);

      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
      prevDate = currDate;
    }

    // Calculate active current streak
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const hasToday = dateSet.has(todayStr);
    const hasYesterday = dateSet.has(yesterdayStr);

    let currentStreak = 0;
    if (hasToday || hasYesterday) {
      const checkDate = hasToday ? new Date(now) : new Date(yesterday);
      while (true) {
        const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (dateSet.has(checkStr)) {
          currentStreak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(maxStreak, currentStreak),
    };
  }

  public getWeeklyVolume(sessions: WorkoutSession[]): DailyActivity[] {
    const result: DailyActivity[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const daySessions = sessions.filter((s) => {
        const ts = s.endTime || s.startTime;
        if (!ts) return false;
        const sd = new Date(ts);
        if (isNaN(sd.getTime())) return false;
        const sDateStr = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`;
        return sDateStr === dateStr;
      });

      const count = daySessions.reduce((acc, s) => {
        const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
        return acc + reps;
      }, 0);
      const calories = parseFloat(daySessions.reduce((acc, s) => acc + (s.caloriesBurned || 0), 0).toFixed(1));
      const durationMinutes = Math.ceil(daySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60);

      result.push({
        date: dateStr,
        count,
        calories,
        durationMinutes,
        hasWorkout: daySessions.length > 0,
      });
    }

    return result;
  }

  public getCurrentWeekActiveDays(sessions: WorkoutSession[]): boolean[] {
    // Returns 7 booleans for Monday..Sunday of the current week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const activeDays: boolean[] = [];

    for (let i = 0; i < 7; i++) {
      const targetDay = new Date(monday);
      targetDay.setDate(monday.getDate() + i);
      const targetStr = `${targetDay.getFullYear()}-${String(targetDay.getMonth() + 1).padStart(2, '0')}-${String(targetDay.getDate()).padStart(2, '0')}`;

      const hasWorkout = sessions.some((s) => {
        const ts = s.endTime || s.startTime;
        if (!ts) return false;
        const sd = new Date(ts);
        if (isNaN(sd.getTime())) return false;
        const sDateStr = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`;
        const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
        return sDateStr === targetStr && (reps > 0 || (s.durationSeconds && s.durationSeconds >= 10));
      });

      activeDays.push(hasWorkout);
    }

    return activeDays;
  }

  public calculateAchievements(
    sessions: WorkoutSession[],
    currentStreak: number,
    totalReps: number,
    _pbs: Record<ExerciseType, PersonalBest | null>
  ): Achievement[] {
    const hasAtLeast1Rep = totalReps >= 1;
    const maxSessionReps = sessions.reduce((max, s) => {
      const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
      return Math.max(max, reps);
    }, 0);
    const hasFlawlessForm = sessions.some((s) => {
      const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
      return (s.averageFormScore || 0) >= 95 && reps >= 30;
    });

    return [
      {
        id: 'ach-first-rep',
        title: 'First Ignition',
        description: 'Complete your first AI-validated repetition with GymBuddy.',
        icon: 'Flame',
        tier: 'bronze',
        category: 'reps',
        progress: hasAtLeast1Rep ? 100 : 0,
        unlocked: hasAtLeast1Rep,
        unlockedAt: hasAtLeast1Rep ? new Date(sessions[sessions.length - 1]?.startTime || Date.now()).toISOString() : undefined,
        requirementText: '1 Valid Rep',
      },
      {
        id: 'ach-streak-7',
        title: 'Relentless Momentum',
        description: 'Maintain an active daily workout streak for 7 consecutive days.',
        icon: 'Zap',
        tier: 'silver',
        category: 'streak',
        progress: Math.min(100, Math.round((currentStreak / 7) * 100)),
        unlocked: currentStreak >= 7,
        requirementText: '7-Day Streak',
      },
      {
        id: 'ach-century-club',
        title: 'Century Club',
        description: 'Accumulate 100 total verified push-ups or sit-ups in a single session.',
        icon: 'Trophy',
        tier: 'gold',
        category: 'reps',
        progress: Math.min(100, Math.round((maxSessionReps / 100) * 100)),
        unlocked: maxSessionReps >= 100,
        requirementText: '100 Reps / Session',
      },
      {
        id: 'ach-flawless-form',
        title: 'Surgical Precision',
        description: 'Achieve a 95%+ average form score in a workout with at least 30 reps.',
        icon: 'ShieldCheck',
        tier: 'gold',
        category: 'form',
        progress: hasFlawlessForm ? 100 : 0,
        unlocked: hasFlawlessForm,
        requirementText: '95% Form on 30+ Reps',
      },
      {
        id: 'ach-iron-will',
        title: 'Iron Will',
        description: 'Reach a total cumulative lifetime count of 1,000 computer-vision verified reps.',
        icon: 'Crown',
        tier: 'platinum',
        category: 'volume',
        progress: Math.min(100, Math.round((totalReps / 1000) * 100)),
        unlocked: totalReps >= 1000,
        requirementText: '1,000 Total Reps',
      },
      {
        id: 'ach-streak-30',
        title: 'Legendary Discipline',
        description: 'Maintain an uninterrupted 30-day streak of daily AI training.',
        icon: 'Sparkles',
        tier: 'diamond',
        category: 'streak',
        progress: Math.min(100, Math.round((currentStreak / 30) * 100)),
        unlocked: currentStreak >= 30,
        requirementText: '30-Day Streak',
      },
    ];
  }

  public getUserProfile(authUser?: AuthUser | null): UserProfile {
    const user = authUser !== undefined ? authUser : authService.getCurrentUser();
    const uid = user?.id;
    const sessions = this.getWorkoutSessions(uid);
    const { currentStreak, longestStreak } = this.calculateStreaks(sessions);
    const pbs = this.getPersonalBests(uid);

    const totalReps = sessions.reduce((acc, s) => {
      const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
      return acc + reps;
    }, 0);
    const formScoreSum = sessions.reduce((acc, s) => acc + (s.averageFormScore || 0), 0);
    const xp = totalReps * 10 + formScoreSum;
    const level = Math.max(1, Math.floor(xp / 1000) + 1);

    const name = user?.name || 'Athlete';
    const email = user?.email || '';
    const id = user?.id || 'usr-local';
    const joinedDate = user?.createdAt
      ? new Date(user.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const cleanPbs: Record<ExerciseType, PersonalBest> = {} as any;
    for (const [k, v] of Object.entries(pbs)) {
      if (v) {
        cleanPbs[k as ExerciseType] = v;
      }
    }

    return {
      id,
      name,
      email,
      joinedDate,
      level,
      xp,
      nextLevelXp: level * 1000,
      currentStreak,
      longestStreak,
      personalBests: cleanPbs,
      recentWorkouts: sessions.slice(0, 10),
      achievements: this.calculateAchievements(sessions, currentStreak, totalReps, pbs),
    };
  }

  public saveUserProfile(profile: UserProfile, userId?: string): void {
    const uid = this.getActiveUserId(userId);
    this.set(`${KEYS.USER_PROFILE}_${uid}`, profile);
    this.notifyListeners();
  }

  public getAchievements(userId?: string): Achievement[] {
    const profile = this.getUserProfile();
    return profile.achievements;
  }

  public getMonthlyStats(userId?: string): MonthlyStats {
    const sessions = this.getWorkoutSessions(userId);
    const totalReps = sessions.reduce((acc, s) => {
      const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
      return acc + reps;
    }, 0);
    const totalWorkouts = sessions.length;
    const totalDurationSec = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const totalCalories = Math.round(sessions.reduce((acc, s) => acc + (s.caloriesBurned || 0), 0));

    const totalScoreSum = sessions.reduce((acc, s) => acc + (s.averageFormScore || 0), 0);
    const averageFormScore = totalWorkouts > 0 ? Math.round(totalScoreSum / totalWorkouts) : 0;

    const pushups = sessions
      .filter((s) => s.exerciseId === 'pushups')
      .reduce((acc, s) => acc + (typeof s.validReps === 'number' ? s.validReps : (s.totalReps || 0)), 0);
    const situps = sessions
      .filter((s) => s.exerciseId === 'situps')
      .reduce((acc, s) => acc + (typeof s.validReps === 'number' ? s.validReps : (s.totalReps || 0)), 0);

    const dailyBreakdown = this.getWeeklyVolume(sessions);

    const now = new Date();
    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return {
      month: monthName,
      totalReps,
      totalWorkouts,
      totalDurationMin: Math.ceil(totalDurationSec / 60),
      totalCalories,
      averageFormScore,
      byExercise: {
        pushups,
        situps,
        squats: 0,
        pullups: 0,
      },
      dailyBreakdown,
    };
  }

  public getSummaryStats(userId?: string): WorkoutSummaryStats {
    const sessions = this.getWorkoutSessions(userId);
    const { currentStreak, longestStreak } = this.calculateStreaks(sessions);
    const totalReps = sessions.reduce((acc, s) => {
      const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
      return acc + reps;
    }, 0);
    const totalWorkouts = sessions.length;
    const totalDurationSec = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const totalCalories = Math.round(sessions.reduce((acc, s) => acc + (s.caloriesBurned || 0), 0));

    const totalScoreSum = sessions.reduce((acc, s) => acc + (s.averageFormScore || 0), 0);
    const accuracyRate = totalWorkouts > 0 ? parseFloat((totalScoreSum / totalWorkouts).toFixed(1)) : 0;

    const totalAttemptedReps = sessions.reduce((acc, s) => acc + (s.totalReps || (typeof s.validReps === 'number' ? s.validReps : 0)), 0);
    const completionRate =
      totalAttemptedReps > 0 ? Math.round((totalReps / totalAttemptedReps) * 100) : 0;

    return {
      totalWorkouts,
      totalReps,
      totalDurationMinutes: Math.ceil(totalDurationSec / 60),
      totalCalories,
      currentStreak,
      longestStreak,
      completionRate,
      accuracyRate,
    };
  }

  public async saveSessionToCloud(session: WorkoutSession, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !userId || userId === 'guest') {
      return false;
    }

    try {
      const row: WorkoutSessionInsert = {
        id: session.id,
        user_id: userId,
        exercise_id: session.exerciseId,
        exercise_name: session.exerciseName,
        start_time: new Date(session.startTime).toISOString(),
        end_time: new Date(session.endTime || Date.now()).toISOString(),
        duration_seconds: Math.max(0, session.durationSeconds || 0),
        total_reps: Math.max(0, session.totalReps || 0),
        valid_reps: Math.max(0, session.validReps || 0),
        invalid_reps: Math.max(0, session.invalidReps || 0),
        average_form_score: Math.min(100, Math.max(0, session.averageFormScore || 0)),
        personal_best_beaten: Boolean(session.personalBestBeaten),
        streak_contribution: session.streakContribution !== false,
        reps_history: (session.repsHistory || []) as unknown as Json,
        feedbacks: (session.feedbacks || []) as unknown as Json,
      };

      const { error } = await supabase
        .from('workout_sessions')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase saveSessionToCloud error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase saveSessionToCloud exception:', err);
      return false;
    }
  }

  public async syncFromCloud(userId?: string): Promise<WorkoutSession[]> {
    const uid = this.getActiveUserId(userId);
    if (!isSupabaseConfigured() || !uid || uid === 'guest') {
      return this.getWorkoutSessions(uid);
    }

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', uid)
        .order('start_time', { ascending: false });

      if (error) {
        console.warn('Supabase syncFromCloud error:', error.message);
        return this.getWorkoutSessions(uid);
      }

      if (!data) {
        return this.getWorkoutSessions(uid);
      }

      const cloudSessions: WorkoutSession[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        exerciseId: row.exercise_id as ExerciseType,
        exerciseName: row.exercise_name,
        startTime: new Date(row.start_time).getTime(),
        endTime: new Date(row.end_time).getTime(),
        durationSeconds: row.duration_seconds,
        totalReps: row.total_reps,
        validReps: row.valid_reps,
        invalidReps: row.invalid_reps,
        averageFormScore: row.average_form_score,
        caloriesBurned: 0,
        personalBestBeaten: row.personal_best_beaten,
        streakContribution: row.streak_contribution,
        repsHistory: Array.isArray(row.reps_history) ? (row.reps_history as unknown as RepEvent[]) : [],
        feedbacks: Array.isArray(row.feedbacks) ? (row.feedbacks as unknown as FormFeedback[]) : [],
      }));

      // Merge with existing local sessions to avoid losing un-uploaded local sessions
      const localSessions = this.getWorkoutSessions(uid);
      const cloudIds = new Set(cloudSessions.map((s) => s.id));
      const unsyncedLocal = localSessions.filter((s) => !cloudIds.has(s.id));

      // Upload any local sessions not yet in cloud in background
      for (const unsynced of unsyncedLocal) {
        this.saveSessionToCloud(unsynced, uid).catch(() => {});
      }

      const merged = [...cloudSessions, ...unsyncedLocal].sort(
        (a, b) => (b.startTime || 0) - (a.startTime || 0)
      );

      const userKey = this.getUserSessionsKey(uid);
      this.set(userKey, merged);
      this.notifyListeners();
      return merged;
    } catch (err) {
      console.warn('Supabase syncFromCloud exception:', err);
      return this.getWorkoutSessions(uid);
    }
  }

  public saveCompletedSession(session: WorkoutSession, userId?: string): { isPersonalBest: boolean; streakCount: number } {
    const uid = this.getActiveUserId(userId);
    const existingSessions = this.getWorkoutSessions(uid);
    
    // Check if this is a personal best before saving
    const previousBest = existingSessions
      .filter((s) => s.exerciseId === session.exerciseId)
      .reduce((max, s) => {
        const reps = typeof s.validReps === 'number' ? s.validReps : (s.totalReps || s.repsHistory?.length || 0);
        return Math.max(max, reps);
      }, 0);

    const sessionReps = typeof session.validReps === 'number' ? session.validReps : (session.totalReps || 0);
    const isPersonalBest = sessionReps > previousBest && sessionReps > 0;

    const sessionWithUser: WorkoutSession = {
      ...session,
      userId: uid,
      personalBestBeaten: isPersonalBest || Boolean(session.personalBestBeaten),
    };

    const existingIndex = existingSessions.findIndex((s) => s.id === session.id);
    let updatedSessions: WorkoutSession[];
    if (existingIndex >= 0) {
      updatedSessions = [...existingSessions];
      updatedSessions[existingIndex] = sessionWithUser;
    } else {
      updatedSessions = [sessionWithUser, ...existingSessions];
    }

    const userKey = this.getUserSessionsKey(uid);
    this.set(userKey, updatedSessions);

    const { currentStreak } = this.calculateStreaks(updatedSessions);

    this.notifyListeners();

    // Asynchronously persist to Supabase if configured and authenticated
    if (isSupabaseConfigured() && uid && uid !== 'guest') {
      this.saveSessionToCloud(sessionWithUser, uid).catch((err) => {
        console.warn('Background Supabase save error:', err);
      });
    }

    return { isPersonalBest, streakCount: currentStreak };
  }

  public clearAllData(userId?: string): void {
    const uid = this.getActiveUserId(userId);
    localStorage.removeItem(`${KEYS.USER_PROFILE}_${uid}`);
    localStorage.removeItem(`${KEYS.WORKOUT_SESSIONS}_${uid}`);
    localStorage.removeItem(KEYS.USER_PROFILE);
    localStorage.removeItem(KEYS.WORKOUT_SESSIONS);
    localStorage.removeItem(KEYS.PERSONAL_BESTS);
    localStorage.removeItem(KEYS.ACHIEVEMENTS);
    localStorage.removeItem(KEYS.MONTHLY_STATS);
    localStorage.removeItem(KEYS.SUMMARY_STATS);
    this.notifyListeners();
  }
}

export const storageService = new StorageService();

