import { ExerciseType } from './exercise';

export type WorkoutStatus = 'idle' | 'calibrating' | 'in-progress' | 'paused' | 'completed';

export interface FormFeedback {
  id: string;
  type: 'good' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export interface RepEvent {
  repNumber: number;
  durationMs: number;
  formScore: number; // 0 to 100
  feedback?: string;
  timestamp: number;
  inflectionAngle?: number;
}

export interface WorkoutSession {
  id: string;
  userId?: string;
  exerciseId: ExerciseType;
  exerciseName: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  totalReps: number;
  validReps: number;
  invalidReps: number;
  averageFormScore: number;
  caloriesBurned: number;
  repsHistory: RepEvent[];
  feedbacks: FormFeedback[];
  personalBestBeaten: boolean;
  streakContribution: boolean;
}

export interface WorkoutSummaryStats {
  totalWorkouts: number;
  totalReps: number;
  totalDurationMinutes: number;
  totalCalories: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  accuracyRate: number;
}
