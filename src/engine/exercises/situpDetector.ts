import { Landmark, PoseLandmarkIndex } from '../../types/pose';
import { RepEvent, FormFeedback } from '../../types/workout';
import { calculateAngle } from '../geometry/calculateAngle';
import { validateSitupPose, PoseValidationGateResult } from '../validation/exercisePoseValidator';
import { MotionHistory, checkLandmarkDisplacementSpike } from '../filtering/motionHistory';
import { SITUP_CONFIG, SitupConfig } from './exerciseConfig';
import {
  IExerciseDetector,
  ExerciseDetectorResult,
  MovementPhase,
  AuthenticationState,
  DetectorTelemetry,
} from './baseDetector';

export type SitupThresholds = SitupConfig;
export const DEFAULT_SITUP_THRESHOLDS = SITUP_CONFIG;

/**
 * Hardened Sit-Up Detector.
 *
 * Final Counting Hardening Rules:
 * 1. Primary Signal: Shoulder → Hip → Knee torso flexion angle.
 * 2. Instantaneous Velocity & Angle Delta Anti-Spike Filter (rejects sudden jerks / sensor noise).
 * 3. Whole-Body Landmark Displacement Spike Filter (rejects camera bumps / tracking pops).
 * 4. Temporal Multi-Frame Continuity: requires consecutive frame consensus before state transitions.
 * 5. Complete Repetition Biomechanical Evidence Accumulation:
 *    Validated Start Posture + Continuous Rise + Valid Peak + Continuous Lowering + Flat Reset + Plausible Duration & ROM.
 * 6. Non-Destructive Spike Recovery: isolated spike frames hold state and resume without restarting workout.
 */
export class SitupDetector implements IExerciseDetector {
  public readonly exerciseId = 'situps';
  private thresholds: SitupThresholds;
  private motionHistory = new MotionHistory(3000);

  // Authentication & State Machine
  private authState: AuthenticationState = 'NOT_READY';
  private currentPhase: MovementPhase = 'idle';
  private repCount: number = 0;

  // Kinematics & Landmarks
  private smoothedTorsoAngle: number | null = null;
  private previousLandmarks: Landmark[] | null = null;
  private startAngle: number = 140;
  private minAngleReached: number = 180;

  // Multi-Frame Transition Confirmation Counters
  private consecutiveTransitionFrames: number = 0;
  private trajectoryPointCount: number = 0;

  // Timestamps
  private startPositionAcquiredTime: number = 0;
  private repStartTime: number = 0;
  private peakReachedTime: number = 0;
  private cooldownUntilTime: number = 0;
  private lastValidPoseTime: number = 0;

  // Diagnostics & Telemetry
  private lastValidation: PoseValidationGateResult | null = null;
  private lastRejectionReason: string | null = null;
  private activeSide: 'left' | 'right' = 'left';
  private trackingStatus: 'GOOD' | 'DEGRADED' | 'GRACE_HOLD' = 'GOOD';
  private motionStatus: 'NORMAL' | 'SPIKE_DETECTED' | 'DISPLACEMENT_SPIKE' = 'NORMAL';
  private movementDirection: 'UP' | 'DOWN' | 'STATIONARY' = 'STATIONARY';
  private currentAngularVelocity: number = 0;

  constructor(thresholds: Partial<SitupThresholds> = {}) {
    this.thresholds = { ...DEFAULT_SITUP_THRESHOLDS, ...thresholds };
  }

  public reset(): void {
    this.authState = 'NOT_READY';
    this.currentPhase = 'idle';
    this.repCount = 0;
    this.smoothedTorsoAngle = null;
    this.previousLandmarks = null;
    this.startAngle = 140;
    this.minAngleReached = 180;
    this.consecutiveTransitionFrames = 0;
    this.trajectoryPointCount = 0;
    this.startPositionAcquiredTime = 0;
    this.repStartTime = 0;
    this.peakReachedTime = 0;
    this.cooldownUntilTime = 0;
    this.lastValidPoseTime = 0;
    this.lastValidation = null;
    this.lastRejectionReason = null;
    this.trackingStatus = 'GOOD';
    this.motionStatus = 'NORMAL';
    this.movementDirection = 'STATIONARY';
    this.currentAngularVelocity = 0;
    this.motionHistory.clear();
  }

  public getRepCount(): number {
    return this.repCount;
  }

  public getTelemetry(): DetectorTelemetry {
    const isArmed = this.authState === 'EXERCISE_ARMED' || this.authState === 'TRACKING_REP' || this.authState === 'COOLDOWN';
    const now = Date.now();
    const stabilityProgressMs = this.startPositionAcquiredTime > 0
      ? Math.min(this.thresholds.requiredStabilityMs, now - this.startPositionAcquiredTime)
      : 0;

    return {
      authState: this.authState,
      isArmed,
      gates: {
        bodyOrientation: this.lastValidation?.gates.bodyOrientation ?? false,
        bodyAlignment: this.lastValidation?.gates.bodyAlignment ?? false,
        kneeGeometry: this.lastValidation?.gates.kneeGeometry ?? true,
        lowerBodyVisible: this.lastValidation?.gates.lowerBodyVisible ?? false,
        confidenceValid: this.lastValidation?.gates.confidenceValid ?? false,
        temporalStability: isArmed,
        motionDirection: this.movementDirection !== 'STATIONARY',
      },
      stabilityProgressMs,
      requiredStabilityMs: this.thresholds.requiredStabilityMs,
      lastRejectionReason: this.lastRejectionReason,
      activeRepDurationMs: this.repStartTime > 0 ? Math.max(0, now - this.repStartTime) : undefined,
      smoothedAngle: this.smoothedTorsoAngle ? Math.round(this.smoothedTorsoAngle) : undefined,
      activeSide: this.activeSide,
      trackingStatus: this.trackingStatus,
      movementDirection: this.movementDirection,
      motionStatus: this.motionStatus,
      angularVelocityDegPerSec: Math.round(this.currentAngularVelocity),
      timeSinceLastValidPoseMs: this.lastValidPoseTime > 0 ? Math.max(0, now - this.lastValidPoseTime) : undefined,
    };
  }

  public processFrame(rawLandmarks: Landmark[], timestamp: number): ExerciseDetectorResult {
    const {
      lyingAngle,
      uprightAngle,
      requiredStabilityMs,
      minRepDurationMs,
      maxRepDurationMs,
      minPeakHoldMs,
      minRangeOfMotion,
      hysteresisMargin,
      minConfidence,
      maxDropoutDurationMs,
      angleSmoothingAlpha,
      maxAngularVelocityDegPerSec,
      maxFrameAngleDeltaDeg,
      maxLandmarkDisplacement,
    } = this.thresholds;

    // 1. Check for sufficient landmark array
    const hasRawLandmarks = Boolean(rawLandmarks && rawLandmarks.length >= 33);

    // 2. Validate posture (anti-standing / grounded check)
    const isArmingCheck = this.authState === 'NOT_READY' || this.authState === 'ACQUIRING_START_POSITION';
    const validation = hasRawLandmarks
      ? validateSitupPose(rawLandmarks, minConfidence, isArmingCheck)
      : {
          valid: false,
          gates: {
            bodyOrientation: false,
            bodyAlignment: false,
            kneeGeometry: false,
            lowerBodyVisible: false,
            confidenceValid: false,
          },
          failureReasons: ['Step back so your body is in the camera frame.'],
          activeSide: this.activeSide,
          confidence: 0,
        };

    this.lastValidation = validation;
    this.activeSide = validation.activeSide;

    let currentTorsoAngle = this.smoothedTorsoAngle ?? 140;
    let feedback: FormFeedback | null = null;
    let newRepCompleted: RepEvent | null = null;
    this.motionStatus = 'NORMAL';

    // =========================================================================
    // 3. WHOLE-BODY LANDMARK DISPLACEMENT SPIKE CHECK
    // =========================================================================
    if (hasRawLandmarks && this.previousLandmarks) {
      const dispCheck = checkLandmarkDisplacementSpike(rawLandmarks, this.previousLandmarks, maxLandmarkDisplacement);
      if (dispCheck.isSpike) {
        this.motionStatus = 'DISPLACEMENT_SPIKE';
        this.lastRejectionReason = `Sudden camera/landmark jump (${dispCheck.avgDisplacement.toFixed(2)})`;
        // Do not advance state machine on displacement spike frame; hold state
        this.previousLandmarks = rawLandmarks;
        return this.buildResult(currentTorsoAngle, null, null, false);
      }
    }
    if (hasRawLandmarks) {
      this.previousLandmarks = rawLandmarks;
    }

    // =========================================================================
    // 4. PRIMARY ANGLE EXTRACTION & ANGULAR VELOCITY SPIKE FILTER
    // =========================================================================
    if (validation.valid) {
      this.lastValidPoseTime = timestamp;
      this.trackingStatus = 'GOOD';

      // Extract primary torso angle (Shoulder - Hip - Knee) for dominant side
      const isLeft = validation.activeSide !== 'right';
      const shoulderIdx = isLeft ? PoseLandmarkIndex.LEFT_SHOULDER : PoseLandmarkIndex.RIGHT_SHOULDER;
      const hipIdx = isLeft ? PoseLandmarkIndex.LEFT_HIP : PoseLandmarkIndex.RIGHT_HIP;
      const kneeIdx = isLeft ? PoseLandmarkIndex.LEFT_KNEE : PoseLandmarkIndex.RIGHT_KNEE;

      const rawAngle = calculateAngle(rawLandmarks[shoulderIdx], rawLandmarks[hipIdx], rawLandmarks[kneeIdx]);

      // Check instantaneous velocity spike
      if (this.smoothedTorsoAngle !== null) {
        const rawDelta = Math.abs(rawAngle - this.smoothedTorsoAngle);
        const dt = Math.max(15, this.motionHistory.getLatestSample() ? timestamp - this.motionHistory.getLatestSample()!.timestamp : 33);
        const instVelocity = (rawDelta / (dt / 1000));
        this.currentAngularVelocity = instVelocity;

        if (rawDelta > maxFrameAngleDeltaDeg && dt <= 70) {
          this.motionStatus = 'SPIKE_DETECTED';
          this.lastRejectionReason = `Sudden motion spike (${rawDelta.toFixed(0)}° jump)`;
          // Ignore spike frame; hold smoothed angle
          return this.buildResult(this.smoothedTorsoAngle, null, null, true);
        }

        if (instVelocity > maxAngularVelocityDegPerSec) {
          this.motionStatus = 'SPIKE_DETECTED';
          this.lastRejectionReason = `Excessive angular velocity (${instVelocity.toFixed(0)}°/s)`;
          return this.buildResult(this.smoothedTorsoAngle, null, null, true);
        }

        // Apply exponential moving average filter
        this.smoothedTorsoAngle = angleSmoothingAlpha * rawAngle + (1 - angleSmoothingAlpha) * this.smoothedTorsoAngle;
      } else {
        this.smoothedTorsoAngle = rawAngle;
      }
      currentTorsoAngle = this.smoothedTorsoAngle;

      // Update motion history
      this.motionHistory.push(timestamp, currentTorsoAngle);
    } else {
      // Temporary tracking degradation handling
      const dropoutMs = timestamp - this.lastValidPoseTime;

      if (this.authState === 'TRACKING_REP' && dropoutMs <= maxDropoutDurationMs && this.smoothedTorsoAngle !== null) {
        // Within grace window: HOLD state and keep tracking smoothly
        this.trackingStatus = 'GRACE_HOLD';
        currentTorsoAngle = this.smoothedTorsoAngle;
      } else {
        // Dropout exceeded or not in active rep: cancel candidate
        this.trackingStatus = 'DEGRADED';
        if (this.authState === 'TRACKING_REP') {
          this.cancelRepCandidate(validation.failureReasons[0] || 'Tracking lost');
        } else {
          this.authState = 'NOT_READY';
          this.currentPhase = 'idle';
          this.startPositionAcquiredTime = 0;
        }

        return this.buildResult(
          currentTorsoAngle,
          {
            id: `fb-pose-${Math.floor(timestamp / 2000)}`,
            type: 'warning',
            message: validation.failureReasons[0] || 'Position yourself on the floor in side view.',
            timestamp,
          },
          null,
          false
        );
      }
    }

    // =========================================================================
    // 5. KINEMATIC TREND & DIRECTION
    // =========================================================================
    const trend = this.motionHistory.getTrend(250);
    if (trend.angularVelocity < -10 || trend.isDecreasing) {
      this.movementDirection = 'UP'; // Torso angle closing = curling up
    } else if (trend.angularVelocity > 10 || trend.isIncreasing) {
      this.movementDirection = 'DOWN'; // Torso angle opening = lowering back
    } else {
      this.movementDirection = 'STATIONARY';
    }

    // =========================================================================
    // 6. STATE MACHINE WITH TEMPORAL CONTINUITY & REP EVIDENCE MODEL
    // =========================================================================
    if (this.authState === 'COOLDOWN') {
      if (timestamp >= this.cooldownUntilTime) {
        this.authState = 'EXERCISE_ARMED';
        this.currentPhase = 'ready';
        this.startAngle = currentTorsoAngle;
        this.consecutiveTransitionFrames = 0;
        this.trajectoryPointCount = 0;
      }
    } else if (this.authState === 'NOT_READY') {
      const isLyingFlat = currentTorsoAngle >= lyingAngle - 10;
      if (isLyingFlat && validation.valid) {
        this.authState = 'ACQUIRING_START_POSITION';
        this.startPositionAcquiredTime = timestamp;
        this.currentPhase = 'idle';
      }
    } else if (this.authState === 'ACQUIRING_START_POSITION') {
      const isLyingFlat = currentTorsoAngle >= lyingAngle - 10;
      if (!isLyingFlat || !validation.valid) {
        this.authState = 'NOT_READY';
        this.startPositionAcquiredTime = 0;
      } else {
        const heldDuration = timestamp - this.startPositionAcquiredTime;
        if (heldDuration >= requiredStabilityMs) {
          this.authState = 'EXERCISE_ARMED';
          this.currentPhase = 'ready';
          this.startAngle = currentTorsoAngle;
          this.consecutiveTransitionFrames = 0;
          this.trajectoryPointCount = 0;
        }
      }
    } else if (this.authState === 'EXERCISE_ARMED' || this.authState === 'TRACKING_REP') {
      switch (this.currentPhase) {
        case 'ready': {
          // Track highest flat angle achieved in ready position
          this.startAngle = Math.max(this.startAngle, currentTorsoAngle);

          // Require continuous closing motion below threshold
          const isCurling = currentTorsoAngle < lyingAngle - hysteresisMargin;
          if (isCurling) {
            this.consecutiveTransitionFrames++;
            if (this.consecutiveTransitionFrames >= 1) {
              this.currentPhase = 'descending'; // 'descending' angle = curling up
              this.authState = 'TRACKING_REP';
              this.repStartTime = timestamp;
              this.minAngleReached = currentTorsoAngle;
              this.consecutiveTransitionFrames = 0;
              this.trajectoryPointCount = 1;
            }
          } else {
            this.consecutiveTransitionFrames = 0;
          }
          break;
        }

        case 'descending': {
          // RISING (curling up)
          this.minAngleReached = Math.min(this.minAngleReached, currentTorsoAngle);
          this.trajectoryPointCount++;

          // Check for timeout (> 4.5s in curl-up)
          if (timestamp - this.repStartTime > 4500) {
            this.cancelRepCandidate('Rep timeout: curl-up took too long');
            break;
          }

          // Check for half-rep (returning back before reaching upright peak)
          if (currentTorsoAngle > this.minAngleReached + 25 && this.minAngleReached > uprightAngle + 15) {
            this.cancelRepCandidate('Incomplete rep: returned before reaching upright position');
            this.currentPhase = 'ready';
            this.authState = 'EXERCISE_ARMED';
            this.startAngle = currentTorsoAngle;
            feedback = {
              id: `fb-peak-${Math.floor(timestamp / 2000)}`,
              type: 'warning',
              message: 'Curl all the way up until your chest is near your knees.',
              timestamp,
            };
            break;
          }

          // Reach upright peak
          if (currentTorsoAngle <= uprightAngle) {
            this.currentPhase = 'bottom'; // 'bottom' = inflection peak
            this.peakReachedTime = timestamp;
            this.consecutiveTransitionFrames = 0;
            this.trajectoryPointCount++;
          }
          break;
        }

        case 'bottom': {
          // TOP (upright peak hold)
          this.minAngleReached = Math.min(this.minAngleReached, currentTorsoAngle);
          this.trajectoryPointCount++;

          const peakHoldDuration = timestamp - this.peakReachedTime;
          const isOpening = currentTorsoAngle > uprightAngle + hysteresisMargin;

          if (peakHoldDuration >= minPeakHoldMs && isOpening) {
            this.currentPhase = 'ascending'; // 'ascending' angle = lowering back to mat
            this.consecutiveTransitionFrames = 0;
            this.trajectoryPointCount++;
          }
          break;
        }

        case 'ascending': {
          // LOWERING back down to mat
          this.trajectoryPointCount++;

          if (timestamp - this.repStartTime > maxRepDurationMs) {
            this.cancelRepCandidate('Rep timeout: exceeded maximum duration');
            break;
          }

          // Check return to flat starting position
          if (currentTorsoAngle >= lyingAngle - 5) {
            const totalRepDuration = timestamp - this.repStartTime;
            const totalROM = this.startAngle - this.minAngleReached;

            const isDurationValid = totalRepDuration >= minRepDurationMs && totalRepDuration <= maxRepDurationMs;
            const isROMValid = totalROM >= minRangeOfMotion;
            const isPeakValid = this.minAngleReached <= uprightAngle + 5;
            const hasTrajectoryEvidence = this.trajectoryPointCount >= 4;

            if (isDurationValid && isROMValid && isPeakValid && hasTrajectoryEvidence) {
              // Full Movement Cycle & Evidence Confirmed!
              this.repCount++;

              const uprightScore = this.minAngleReached <= 60 ? 100 : (uprightAngle / Math.max(1, this.minAngleReached)) * 100;
              const formScore = Math.min(100, Math.max(50, Math.round(uprightScore)));

              newRepCompleted = {
                repNumber: this.repCount,
                durationMs: totalRepDuration,
                formScore,
                timestamp,
                inflectionAngle: this.minAngleReached,
              };

              this.currentPhase = 'rep_counted';
              this.authState = 'COOLDOWN';
              this.cooldownUntilTime = timestamp + 100; // 100ms cooldown
              this.minAngleReached = 180;
              this.startAngle = 140;
              this.repStartTime = 0;
              this.consecutiveTransitionFrames = 0;
              this.trajectoryPointCount = 0;
            } else {
              let reason = 'Rep rejected: ';
              if (!isDurationValid) reason += `duration (${totalRepDuration}ms) unnatural; `;
              if (!isROMValid) reason += `insufficient range of motion (${totalROM.toFixed(0)}° < ${minRangeOfMotion}°); `;
              if (!isPeakValid) reason += `insufficient peak (${this.minAngleReached.toFixed(0)}° > ${uprightAngle}°); `;
              if (!hasTrajectoryEvidence) reason += 'insufficient continuous trajectory points; ';
              this.cancelRepCandidate(reason);
              this.currentPhase = 'ready';
              this.authState = 'EXERCISE_ARMED';
              this.startAngle = currentTorsoAngle;
            }
          }
          break;
        }

        case 'rep_counted':
        case 'top': {
          this.currentPhase = 'ready';
          this.authState = 'EXERCISE_ARMED';
          break;
        }
      }
    }

    return this.buildResult(currentTorsoAngle, feedback, newRepCompleted, validation.valid || this.trackingStatus === 'GRACE_HOLD');
  }

  private cancelRepCandidate(reason: string): void {
    this.lastRejectionReason = reason;
    this.repStartTime = 0;
    this.minAngleReached = 180;
    this.consecutiveTransitionFrames = 0;
    this.trajectoryPointCount = 0;
    this.authState = 'NOT_READY';
    this.currentPhase = 'idle';
    this.startPositionAcquiredTime = 0;
  }

  private buildResult(
    primaryAngle: number,
    feedback: FormFeedback | null,
    newRepCompleted: RepEvent | null,
    landmarksValid: boolean
  ): ExerciseDetectorResult {
    let progress = 0;
    const range = this.thresholds.lyingAngle - this.thresholds.uprightAngle;

    if (this.currentPhase === 'descending') {
      progress = Math.max(0, Math.min(50, ((this.thresholds.lyingAngle - primaryAngle) / range) * 50));
    } else if (this.currentPhase === 'bottom') {
      progress = 50;
    } else if (this.currentPhase === 'ascending') {
      progress = Math.max(50, Math.min(100, 50 + ((primaryAngle - this.thresholds.uprightAngle) / range) * 50));
    } else if (this.currentPhase === 'rep_counted' || this.currentPhase === 'ready') {
      progress = 0;
    }

    return {
      currentPhase: this.currentPhase,
      progressPercent: Math.round(progress),
      primaryAngle: Math.round(primaryAngle),
      secondaryAngle: undefined,
      feedback,
      newRepCompleted,
      landmarksValid,
      telemetry: this.getTelemetry(),
    };
  }
}
