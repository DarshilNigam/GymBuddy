import { ExerciseType, ExerciseConfig } from '../types/exercise';
import { WorkoutSession, RepEvent, FormFeedback } from '../types/workout';
import { EXERCISE_CONFIGS } from './mockData';
import { storageService } from './storageService';

export class WorkoutService {
  public static getExerciseConfig(id: ExerciseType): ExerciseConfig {
    const config = EXERCISE_CONFIGS[id];
    if (!config) {
      throw new Error(`Exercise ${id} not found in configuration.`);
    }
    return config;
  }

  public static getAllExercises(): ExerciseConfig[] {
    return Object.values(EXERCISE_CONFIGS);
  }

  public static createSession(exerciseId: ExerciseType): WorkoutSession {
    const config = this.getExerciseConfig(exerciseId);
    return {
      id: `wk-${Date.now()}`,
      exerciseId,
      exerciseName: config.name,
      startTime: Date.now(),
      durationSeconds: 0,
      totalReps: 0,
      validReps: 0,
      invalidReps: 0,
      averageFormScore: 0,
      caloriesBurned: 0,
      repsHistory: [],
      feedbacks: [],
      personalBestBeaten: false,
      streakContribution: true,
    };
  }

  public static finalizeSession(
    session: WorkoutSession,
    repsHistory: RepEvent[],
    feedbacks: FormFeedback[],
    durationSeconds: number
  ): WorkoutSession {
    const config = this.getExerciseConfig(session.exerciseId);
    const validReps = repsHistory.length;
    const invalidReps = 0;
    
    const avgScore =
      repsHistory.length > 0
        ? Math.round(repsHistory.reduce((acc, r) => acc + r.formScore, 0) / repsHistory.length)
        : 0;

    const caloriesBurned = parseFloat((validReps * config.caloriesPerRep).toFixed(1));

    const finalSession: WorkoutSession = {
      ...session,
      endTime: Date.now(),
      durationSeconds,
      totalReps: repsHistory.length,
      validReps,
      invalidReps,
      averageFormScore: avgScore,
      caloriesBurned,
      repsHistory,
      feedbacks,
    };

    const { isPersonalBest } = storageService.saveCompletedSession(finalSession);
    finalSession.personalBestBeaten = isPersonalBest;

    return finalSession;
  }
}
