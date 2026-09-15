import { storageService } from '../storageService';
import { WorkoutSession } from '../../types/workout';
import { authService, AuthUser } from '../authService';

// In-Memory LocalStorage Mock for testing environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Setup global localStorage mock
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.getItem) {
  (globalThis as any).localStorage = new MockLocalStorage();
}

export function runAllDataIntegrityTests(): { total: number; passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      console.log(`  [PASS] ${name}`);
    } catch (e: any) {
      failed++;
      const msg = `  [FAIL] ${name}: ${e.message}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  console.log('--- RUNNING GYMBUDDY POST-WORKOUT DATA INTEGRITY TESTS ---');

  // TEST 1: Empty History on a brand new account
  test('Test 1: Empty History on new account returns zeroed metrics', () => {
    localStorage.clear();
    const mockUser: AuthUser = { id: 'usr-new-01', email: 'new@gymbuddy.ai', name: 'New Athlete', createdAt: Date.now() };
    
    const sessions = storageService.getWorkoutSessions(mockUser.id);
    assert(sessions.length === 0, 'New user must have 0 sessions');

    const profile = storageService.getUserProfile(mockUser);
    assert(profile.currentStreak === 0, 'New user currentStreak must be 0');
    assert(profile.longestStreak === 0, 'New user longestStreak must be 0');
    assert(profile.name === 'New Athlete', 'User profile must reflect registered name');
    assert(profile.recentWorkouts.length === 0, 'Recent workouts must be empty');

    const stats = storageService.getMonthlyStats(mockUser.id);
    assert(stats.totalReps === 0, 'Monthly total reps must be 0');
    assert(stats.totalWorkouts === 0, 'Monthly total workouts must be 0');
    assert(stats.byExercise.pushups === 0, 'Push-up total must be 0');
    assert(stats.byExercise.situps === 0, 'Sit-up total must be 0');

    const pbs = storageService.getPersonalBests(mockUser.id);
    assert(pbs.pushups === null, 'No push-up PB yet');
    assert(pbs.situps === null, 'No sit-up PB yet');
  });

  // TEST 2: Single Valid Workout Session
  test('Test 2: Single valid workout session stores exact verified values', () => {
    localStorage.clear();
    const userId = 'usr-test-02';
    const now = Date.now();
    const session: WorkoutSession = {
      id: 'wk-1',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: now - 60000,
      endTime: now,
      durationSeconds: 60,
      totalReps: 15,
      validReps: 15,
      invalidReps: 0,
      averageFormScore: 92,
      caloriesBurned: 4.8,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: true,
      streakContribution: true,
    };

    const res = storageService.saveCompletedSession(session, userId);
    assert(res.isPersonalBest === true, 'First session with 15 reps must be personal best');

    const sessions = storageService.getWorkoutSessions(userId);
    assert(sessions.length === 1, 'Exactly 1 session stored');
    assert(sessions[0].validReps === 15, 'Valid reps must be exactly 15');
    assert(sessions[0].averageFormScore === 92, 'Average form score must be exactly 92');

    const pbs = storageService.getPersonalBests(userId);
    assert(pbs.pushups !== null && pbs.pushups.maxReps === 15, 'Push-up PB must be 15');
  });

  // TEST 3: Zero-Rep Workout
  test('Test 3: Zero-rep workout is recorded without phantom reps', () => {
    localStorage.clear();
    const userId = 'usr-test-03';
    const now = Date.now();
    const zeroRepSession: WorkoutSession = {
      id: 'wk-zero',
      exerciseId: 'situps',
      exerciseName: 'Sit-ups',
      startTime: now - 30000,
      endTime: now,
      durationSeconds: 30,
      totalReps: 0,
      validReps: 0,
      invalidReps: 0,
      averageFormScore: 0,
      caloriesBurned: 0,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: false,
      streakContribution: false,
    };

    const res = storageService.saveCompletedSession(zeroRepSession, userId);
    assert(res.isPersonalBest === false, 'Zero-rep session must not be personal best');

    const sessions = storageService.getWorkoutSessions(userId);
    assert(sessions.length === 1, 'Session is stored');
    assert(sessions[0].validReps === 0, 'Valid reps must remain 0');

    const stats = storageService.getMonthlyStats(userId);
    assert(stats.totalReps === 0, 'Total reps must remain 0');
    assert(stats.totalWorkouts === 1, 'Total workouts incremented to 1');
  });

  // TEST 4: Same-Day Multiple Workouts
  test('Test 4: Multiple workouts on the same calendar day count as 1 streak day', () => {
    localStorage.clear();
    const userId = 'usr-test-04';
    const todayNoon = new Date();
    todayNoon.setHours(12, 0, 0, 0);
    const now = todayNoon.getTime();
    
    const session1: WorkoutSession = {
      id: 'wk-same-1',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: now - 3600000,
      endTime: now - 3500000,
      durationSeconds: 100,
      totalReps: 20,
      validReps: 20,
      invalidReps: 0,
      averageFormScore: 90,
      caloriesBurned: 6.4,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: true,
      streakContribution: true,
    };

    const session2: WorkoutSession = {
      id: 'wk-same-2',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: now - 1800000,
      endTime: now - 1700000,
      durationSeconds: 100,
      totalReps: 25,
      validReps: 25,
      invalidReps: 0,
      averageFormScore: 95,
      caloriesBurned: 8.0,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: true,
      streakContribution: true,
    };

    storageService.saveCompletedSession(session1, userId);
    storageService.saveCompletedSession(session2, userId);

    const sessions = storageService.getWorkoutSessions(userId);
    assert(sessions.length === 2, '2 sessions stored');

    const { currentStreak, longestStreak } = storageService.calculateStreaks(sessions);
    assert(currentStreak === 1, `Expected currentStreak = 1 for same-day sessions, got ${currentStreak}`);
    assert(longestStreak === 1, `Expected longestStreak = 1, got ${longestStreak}`);

    const stats = storageService.getMonthlyStats(userId);
    assert(stats.totalReps === 45, `Expected totalReps = 45 (20+25), got ${stats.totalReps}`);
  });

  // TEST 5: Consecutive-Day Streak (3 days in a row)
  test('Test 5: 3 consecutive training days calculate active streak of 3', () => {
    localStorage.clear();
    const userId = 'usr-test-05';
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const s3: WorkoutSession = { id: 's3', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now, endTime: now + 60000, durationSeconds: 60, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 90, caloriesBurned: 6, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };
    const s2: WorkoutSession = { id: 's2', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now - oneDayMs, endTime: now - oneDayMs + 60000, durationSeconds: 60, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 90, caloriesBurned: 6, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };
    const s1: WorkoutSession = { id: 's1', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now - 2 * oneDayMs, endTime: now - 2 * oneDayMs + 60000, durationSeconds: 60, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 90, caloriesBurned: 6, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };

    const { currentStreak, longestStreak } = storageService.calculateStreaks([s3, s2, s1]);
    assert(currentStreak === 3, `Expected current streak = 3, got ${currentStreak}`);
    assert(longestStreak === 3, `Expected longest streak = 3, got ${longestStreak}`);
  });

  // TEST 6: Broken Streak with Gap Day
  test('Test 6: Rest day gap resets current streak to active contiguous run', () => {
    localStorage.clear();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Today (Day 0), Yesterday (Day 1), Gap (Day 2), 3 Days Ago (Day 3), 4 Days Ago (Day 4)
    const s0: WorkoutSession = { id: 's0', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now, endTime: now + 60000, durationSeconds: 60, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 90, caloriesBurned: 6, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };
    const s1: WorkoutSession = { id: 's1', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now - oneDayMs, endTime: now - oneDayMs + 60000, durationSeconds: 60, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 90, caloriesBurned: 6, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };
    const s3: WorkoutSession = { id: 's3', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now - 3 * oneDayMs, endTime: now - 3 * oneDayMs + 60000, durationSeconds: 60, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 90, caloriesBurned: 6, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };
    const s4: WorkoutSession = { id: 's4', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now - 4 * oneDayMs, endTime: now - 4 * oneDayMs + 60000, durationSeconds: 60, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 90, caloriesBurned: 6, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };

    const { currentStreak, longestStreak } = storageService.calculateStreaks([s0, s1, s3, s4]);
    assert(currentStreak === 2, `Expected current streak = 2 (today + yesterday), got ${currentStreak}`);
    assert(longestStreak === 2, `Expected longest streak = 2, got ${longestStreak}`);
  });

  // TEST 7: Longest Streak Benchmark Calculation
  test('Test 7: All-time longest streak persists even after streak breaks', () => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // 5-day streak in past (days 10, 9, 8, 7, 6 ago), then gap, then today (day 0)
    const past5Days = [10, 9, 8, 7, 6].map((d, i) => ({
      id: `p-${i}`,
      exerciseId: 'pushups' as const,
      exerciseName: 'Push-ups',
      startTime: now - d * oneDayMs,
      endTime: now - d * oneDayMs + 60000,
      durationSeconds: 60,
      totalReps: 20,
      validReps: 20,
      invalidReps: 0,
      averageFormScore: 90,
      caloriesBurned: 6,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: false,
      streakContribution: true,
    }));

    const todaySession: WorkoutSession = {
      id: 'today',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: now,
      endTime: now + 60000,
      durationSeconds: 60,
      totalReps: 20,
      validReps: 20,
      invalidReps: 0,
      averageFormScore: 90,
      caloriesBurned: 6,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: false,
      streakContribution: true,
    };

    const { currentStreak, longestStreak } = storageService.calculateStreaks([todaySession, ...past5Days]);
    assert(currentStreak === 1, `Expected current streak = 1 (today only), got ${currentStreak}`);
    assert(longestStreak === 5, `Expected longest streak = 5 (from past run), got ${longestStreak}`);
  });

  // TEST 8: Weekly Volume 7-Day Window
  test('Test 8: Weekly volume contains exactly 7 calendar days with accurate sums', () => {
    localStorage.clear();
    const now = new Date();
    const session: WorkoutSession = {
      id: 'wk-wv-1',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: now.getTime(),
      endTime: now.getTime() + 60000,
      durationSeconds: 60,
      totalReps: 30,
      validReps: 30,
      invalidReps: 0,
      averageFormScore: 95,
      caloriesBurned: 9.6,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: true,
      streakContribution: true,
    };

    const volume = storageService.getWeeklyVolume([session]);
    assert(volume.length === 7, `Expected 7 daily breakdown entries, got ${volume.length}`);
    const todayVolume = volume[volume.length - 1];
    assert(todayVolume.count === 30, `Expected today rep count = 30, got ${todayVolume.count}`);
    assert(todayVolume.hasWorkout === true, 'Today hasWorkout must be true');

    // 5 days ago should be 0
    const olderVolume = volume[0];
    assert(olderVolume.count === 0, `Expected 0 reps for day without workout, got ${olderVolume.count}`);
    assert(olderVolume.hasWorkout === false, 'hasWorkout must be false for empty days');
  });

  // TEST 9: Account Isolation (User A vs User B)
  test('Test 9: Complete data isolation between different user accounts', () => {
    localStorage.clear();
    const userA = 'usr-alice';
    const userB = 'usr-bob';

    const sessionA: WorkoutSession = {
      id: 'wk-alice-1',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: Date.now(),
      endTime: Date.now() + 60000,
      durationSeconds: 60,
      totalReps: 50,
      validReps: 50,
      invalidReps: 0,
      averageFormScore: 96,
      caloriesBurned: 16.0,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: true,
      streakContribution: true,
    };

    storageService.saveCompletedSession(sessionA, userA);

    // Verify User A data
    const sessionsA = storageService.getWorkoutSessions(userA);
    assert(sessionsA.length === 1, 'User A must have 1 session');
    assert(sessionsA[0].validReps === 50, 'User A session has 50 reps');

    // Verify User B has ZERO data (no leak)
    const sessionsB = storageService.getWorkoutSessions(userB);
    assert(sessionsB.length === 0, 'User B must have 0 sessions');

    const statsB = storageService.getMonthlyStats(userB);
    assert(statsB.totalReps === 0, 'User B total reps must be 0');
    assert(statsB.totalWorkouts === 0, 'User B total workouts must be 0');

    const pbsB = storageService.getPersonalBests(userB);
    assert(pbsB.pushups === null, 'User B has no push-up PB');
  });

  // TEST 10: Deduplication Idempotency
  test('Test 10: Saving a session with existing ID updates rather than duplicates', () => {
    localStorage.clear();
    const userId = 'usr-dedup';
    const session: WorkoutSession = {
      id: 'wk-unique-99',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: Date.now(),
      endTime: Date.now() + 60000,
      durationSeconds: 60,
      totalReps: 20,
      validReps: 20,
      invalidReps: 0,
      averageFormScore: 90,
      caloriesBurned: 6.4,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: true,
      streakContribution: true,
    };

    storageService.saveCompletedSession(session, userId);
    storageService.saveCompletedSession(session, userId); // Accidental second call

    const sessions = storageService.getWorkoutSessions(userId);
    assert(sessions.length === 1, `Expected exactly 1 session after duplicate save, got ${sessions.length}`);
  });

  // TEST 11: Chronological Ordering of Recent Sessions
  test('Test 11: Recent sessions are sorted newest first', () => {
    localStorage.clear();
    const userId = 'usr-order';
    const now = Date.now();

    const sOlder: WorkoutSession = { id: 's-older', exerciseId: 'pushups', exerciseName: 'Push-ups', startTime: now - 3600000, endTime: now - 3500000, durationSeconds: 100, totalReps: 10, validReps: 10, invalidReps: 0, averageFormScore: 85, caloriesBurned: 3.2, repsHistory: [], feedbacks: [], personalBestBeaten: false, streakContribution: true };
    const sNewer: WorkoutSession = { id: 's-newer', exerciseId: 'situps', exerciseName: 'Sit-ups', startTime: now - 1800000, endTime: now - 1700000, durationSeconds: 100, totalReps: 20, validReps: 20, invalidReps: 0, averageFormScore: 95, caloriesBurned: 5.0, repsHistory: [], feedbacks: [], personalBestBeaten: true, streakContribution: true };

    storageService.saveCompletedSession(sOlder, userId);
    storageService.saveCompletedSession(sNewer, userId);

    const profile = storageService.getUserProfile({ id: userId, name: 'Athlete', email: 'test@test.com', createdAt: now });
    assert(profile.recentWorkouts[0].id === 's-newer', 'Newer session must be first in recent workouts');
    assert(profile.recentWorkouts[1].id === 's-older', 'Older session must be second');
  });

  // TEST 12: Pub/Sub Reactivity
  test('Test 12: storageService notifies subscribers when session is saved', () => {
    localStorage.clear();
    let notified = false;
    const unsub = storageService.subscribe(() => {
      notified = true;
    });

    const session: WorkoutSession = {
      id: 'wk-sub',
      exerciseId: 'pushups',
      exerciseName: 'Push-ups',
      startTime: Date.now(),
      endTime: Date.now() + 60000,
      durationSeconds: 60,
      totalReps: 10,
      validReps: 10,
      invalidReps: 0,
      averageFormScore: 90,
      caloriesBurned: 3.2,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: false,
      streakContribution: true,
    };

    storageService.saveCompletedSession(session, 'usr-sub');
    assert(Boolean(notified), 'Subscriber should be notified on saveCompletedSession');
    unsub();
  });

  console.log(`--- DATA INTEGRITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  return { total: passed + failed, passed, failed, errors };
}
