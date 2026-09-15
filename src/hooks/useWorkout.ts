import { useState, useEffect, useRef, useCallback } from 'react';
import { ExerciseType } from '../types/exercise';
import { FormFeedback, RepEvent, WorkoutSession, WorkoutStatus } from '../types/workout';
import { Landmark } from '../types/pose';
import { IExerciseDetector, MovementPhase, DetectorTelemetry } from '../engine/exercises/baseDetector';
import { PushupDetector } from '../engine/exercises/pushupDetector';
import { SitupDetector } from '../engine/exercises/situpDetector';
import { WorkoutService } from '../services/workoutService';

export interface UseWorkoutOptions {
  exerciseId: ExerciseType;
  onFinish?: (finalSession: WorkoutSession) => void;
}

export interface UseWorkoutReturn {
  session: WorkoutSession;
  status: WorkoutStatus;
  elapsedSeconds: number;
  validReps: number;
  currentPhase: MovementPhase;
  progressPercent: number;
  primaryAngle: number;
  latestFeedback: FormFeedback | null;
  feedbacks: FormFeedback[];
  repsHistory: RepEvent[];
  telemetry: DetectorTelemetry | null;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => WorkoutSession;
  processPoseFrame: (landmarks: Landmark[], timestamp: number) => void;
  recordManualRepForDemo?: (formScore?: number) => void;
}

export function useWorkout({ exerciseId, onFinish }: UseWorkoutOptions): UseWorkoutReturn {
  const [session, setSession] = useState<WorkoutSession>(() => WorkoutService.createSession(exerciseId));
  const [status, setStatus] = useState<WorkoutStatus>('calibrating');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [validReps, setValidReps] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<MovementPhase>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [primaryAngle, setPrimaryAngle] = useState(180);
  const [latestFeedback, setLatestFeedback] = useState<FormFeedback | null>(null);
  const [feedbacks, setFeedbacks] = useState<FormFeedback[]>([]);
  const [repsHistory, setRepsHistory] = useState<RepEvent[]>([]);
  const [telemetry, setTelemetry] = useState<DetectorTelemetry | null>(null);

  // Detector instance ref
  const detectorRef = useRef<IExerciseDetector | null>(null);

  // Initialize correct detector on mount or exercise change
  useEffect(() => {
    if (exerciseId === 'pushups') {
      detectorRef.current = new PushupDetector();
    } else if (exerciseId === 'situps') {
      detectorRef.current = new SitupDetector();
    } else {
      detectorRef.current = new PushupDetector();
    }
    detectorRef.current.reset();

    return () => {
      detectorRef.current?.reset();
    };
  }, [exerciseId]);

  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsedSeconds;

  const repsHistoryRef = useRef<RepEvent[]>([]);
  repsHistoryRef.current = repsHistory;

  const feedbacksRef = useRef<FormFeedback[]>([]);
  feedbacksRef.current = feedbacks;

  const statusRef = useRef<WorkoutStatus>(status);
  statusRef.current = status;

  // Workout timer
  useEffect(() => {
    if (status === 'in-progress') {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  const startWorkout = useCallback(() => {
    setStatus('in-progress');
    detectorRef.current?.reset();
    setLatestFeedback({
      id: `fb-start-${Date.now()}`,
      type: 'info',
      message: 'Workout active. Move into starting position.',
      timestamp: Date.now(),
    });
  }, []);

  const pauseWorkout = useCallback(() => {
    setStatus('paused');
  }, []);

  const isFinalizedRef = useRef(false);
  const finalizedSessionRef = useRef<WorkoutSession | null>(null);

  const resumeWorkout = useCallback(() => {
    setStatus('in-progress');
  }, []);

  const finishWorkout = useCallback((): WorkoutSession => {
    if (isFinalizedRef.current && finalizedSessionRef.current) {
      return finalizedSessionRef.current;
    }
    isFinalizedRef.current = true;
    setStatus('completed');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalSession = WorkoutService.finalizeSession(
      session,
      repsHistoryRef.current,
      feedbacksRef.current,
      elapsedRef.current
    );

    finalizedSessionRef.current = finalSession;
    setSession(finalSession);
    if (onFinish) {
      onFinish(finalSession);
    }
    return finalSession;
  }, [onFinish, session]);

  // Real-time pose frame processing
  const processPoseFrame = useCallback((landmarks: Landmark[], timestamp: number) => {
    const detector = detectorRef.current;
    if (!detector) return;

    const currentStatus = statusRef.current;

    // Process through detector
    const result = detector.processFrame(landmarks, timestamp);

    // Update real-time joint angles, phases, and telemetry
    setCurrentPhase(result.currentPhase);
    setProgressPercent(result.progressPercent);
    setPrimaryAngle(result.primaryAngle);
    if (result.telemetry) {
      setTelemetry(result.telemetry);
    }

    // Only count reps and record feedback during in-progress status
    if (currentStatus === 'in-progress') {
      if (result.feedback) {
        setLatestFeedback(result.feedback);
        // Avoid duplicate spam in feedback history
        setFeedbacks((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.message !== result.feedback!.message || timestamp - last.timestamp > 3000) {
            return [...prev, result.feedback!];
          }
          return prev;
        });
      }

      if (result.newRepCompleted) {
        const completedRep = result.newRepCompleted;
        setRepsHistory((prev) => [...prev, completedRep]);
        setValidReps(detector.getRepCount());

        const isGoodForm = completedRep.formScore >= 75;
        const repFeedback: FormFeedback = {
          id: `fb-rep-${completedRep.repNumber}-${timestamp}`,
          type: isGoodForm ? 'good' : 'info',
          message: `Rep ${completedRep.repNumber} recorded (${completedRep.formScore}% form)!`,
          timestamp,
        };
        setLatestFeedback(repFeedback);
        setFeedbacks((prev) => [...prev, repFeedback]);
      }
    }
  }, []);

  /**
   * Developer QA harness: only used in development environments.
   */
  const recordManualRepForDemo = useCallback((formScore: number = 85) => {
    if (!import.meta.env.DEV) return;
    const now = Date.now();
    const repNumber = repsHistoryRef.current.length + 1;
    const newRep: RepEvent = {
      repNumber,
      durationMs: 2000,
      formScore: Math.min(100, Math.max(0, formScore)),
      timestamp: now,
      inflectionAngle: 88,
    };

    setRepsHistory((prev) => [...prev, newRep]);
    setValidReps((prev) => prev + (formScore >= 60 ? 1 : 0));
    setCurrentPhase('rep_counted');
    setProgressPercent(100);
    setLatestFeedback({
      id: `fb-manual-${now}`,
      type: 'good',
      message: `[DEV ONLY] Rep ${repNumber} recorded.`,
      timestamp: now,
    });

    setTimeout(() => {
      setCurrentPhase('ready');
      setProgressPercent(0);
    }, 300);
  }, []);

  return {
    session,
    status,
    elapsedSeconds,
    validReps,
    currentPhase,
    progressPercent,
    primaryAngle,
    latestFeedback,
    feedbacks,
    repsHistory,
    telemetry,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    processPoseFrame,
    recordManualRepForDemo: import.meta.env.DEV ? recordManualRepForDemo : undefined,
  };
}
