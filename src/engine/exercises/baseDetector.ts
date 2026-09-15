import { Landmark } from '../../types/pose';
import { RepEvent, FormFeedback } from '../../types/workout';

export type MovementPhase =
  | 'idle'
  | 'ready'
  | 'descending'
  | 'bottom'
  | 'ascending'
  | 'top'
  | 'rep_counted';

export type AuthenticationState =
  | 'NOT_READY'
  | 'ACQUIRING_START_POSITION'
  | 'START_POSITION_STABLE'
  | 'EXERCISE_ARMED'
  | 'TRACKING_REP'
  | 'REP_VALIDATED'
  | 'COOLDOWN';

export interface DetectorTelemetry {
  authState: AuthenticationState;
  isArmed: boolean;
  gates: {
    bodyOrientation: boolean;
    bodyAlignment: boolean;
    armGeometry?: boolean;
    hipGeometry?: boolean;
    kneeGeometry?: boolean;
    lowerBodyVisible: boolean;
    confidenceValid: boolean;
    temporalStability: boolean;
    motionDirection: boolean;
  };
  stabilityProgressMs: number;
  requiredStabilityMs: number;
  lastRejectionReason: string | null;
  activeRepDurationMs?: number;
  // Enhanced telemetry for real-world debugging:
  smoothedAngle?: number;
  activeSide?: 'left' | 'right';
  trackingStatus?: 'GOOD' | 'DEGRADED' | 'GRACE_HOLD';
  movementDirection?: 'UP' | 'DOWN' | 'STATIONARY';
  timeSinceLastValidPoseMs?: number;
  motionStatus?: 'NORMAL' | 'SPIKE_DETECTED' | 'DISPLACEMENT_SPIKE';
  angularVelocityDegPerSec?: number;
}

export interface ExerciseDetectorResult {
  currentPhase: MovementPhase;
  progressPercent: number; // 0 to 100% of current rep completion
  primaryAngle: number; // e.g. elbow or hip angle
  secondaryAngle?: number; // e.g. spine/body line angle
  feedback: FormFeedback | null;
  newRepCompleted: RepEvent | null;
  landmarksValid: boolean;
  telemetry?: DetectorTelemetry;
}

export interface IExerciseDetector {
  readonly exerciseId: string;
  processFrame(landmarks: Landmark[], timestamp: number): ExerciseDetectorResult;
  reset(): void;
  getRepCount(): number;
  getTelemetry?(): DetectorTelemetry;
}
