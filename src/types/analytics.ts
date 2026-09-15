import { ExerciseType } from './exercise';
import { WorkoutSession } from './workout';

export interface PersonalBest {
  exerciseId: ExerciseType;
  exerciseName: string;
  maxReps: number;
  bestSessionDuration: number;
  bestFormScore: number;
  achievedAt: string; // ISO date
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  calories: number;
  durationMinutes: number;
  hasWorkout: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'streak' | 'reps' | 'form' | 'volume';
  progress: number; // 0 to 100
  unlocked: boolean;
  unlockedAt?: string;
  requirementText: string;
}

export interface MonthlyStats {
  month: string; // "October 2026"
  totalReps: number;
  totalWorkouts: number;
  totalDurationMin: number;
  totalCalories: number;
  averageFormScore: number;
  byExercise: Record<ExerciseType, number>;
  dailyBreakdown: DailyActivity[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedDate: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  currentStreak: number;
  longestStreak: number;
  personalBests: Record<ExerciseType, PersonalBest>;
  recentWorkouts: WorkoutSession[];
  achievements: Achievement[];
}
