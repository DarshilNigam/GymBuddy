import { Landmark, PoseLandmarkIndex } from '../../types/pose';
import { RepEvent, FormFeedback } from '../../types/workout';
import { calculateAngle } from '../geometry/calculateAngle';
import { validatePushupPose, PoseValidationGateResult } from '../validation/exercisePoseValidator';
import { LandmarkTemporalFilter } from '../filtering/temporalSmoothing';
import { MotionHistory, checkLandmarkDisplacementSpike } from '../filtering/motionHistory';
import { PUSHUP_CONFIG, PushupConfig } from './exerciseConfig';
import {
  IExerciseDetector,
  ExerciseDetectorResult,
  MovementPhase,
  AuthenticationState,
  DetectorTelemetry,
} from './baseDetector';

export type PushupThresholds = PushupConfig;
export const DEFAULT_PUSHUP_THRESHOLDS = PUSHUP_CONFIG;

/**
 * Hardened Push-Up Detector.
 *
 * Final Counting Hardening Rules:
 * 1. Primary Signal: Shoulder → Elbow → Wrist flexion angle; Secondary Signal: Shoulder → Hip → Ankle spine alignment.
 * 2. Instantaneous Velocity & Angle Delta Anti-Spike Filter (rejects sudden jerks / sensor noise).
 * 3. Whole-Body Landmark Displacement Spike Filter (rejects camera bumps / tracking pops).
 * 4. Temporal Multi-Frame Continuity: requires consecutive frame consensus before state transitions.
 * 5. Complete Repetition Biomechanical Evidence Accumulation:
 *    Validated Plank Posture + Continuous Descent + Depth Hold + Continuous Ascent + Lockout Hold + Plausible Duration & ROM.
 * 6. Non-Destructive Spike Recovery: isolated spike frames hold state and resume without restarting workout.
 */
export class PushupDetector implements IExerciseDetector {
  public readonly exerciseId = 'pushups';
  private thresholds: PushupThresholds;
  private filter = new LandmarkTemporalFilter(0.65);
  private motionHistory = new MotionHistory(3000);

  // Authentication & Movement State
  private authState: AuthenticationState = 'NOT_READY';
  private currentPhase: MovementPhase = 'idle';
  private repCount: number = 0;

  // Kinematics & Landmarks
  private smoothedElbowAngle: number | null = null;
  private previousLandmarks: Landmark[] | null = null;
  private startAngle: number = 180;
  private minAngleReached: number = 180;
  private spineAlignmentHistory: number[] = [];

  // Multi-Frame Transition Confirmation Counters
  private consecutiveTransitionFrames: number = 0;
  private trajectoryPointCount: number = 0;

  // Timestamps
  private startPositionAcquiredTime: number = 0;
  private repStartTime: number = 0;
  private bottomReachedTime: number = 0;
  private cooldownUntilTime: number = 0;
  private lastValidPoseTime: number = 0;

  // Diagnostics & Telemetry
  private lastRejectionReason: string | null = null;
  private lastValidation: PoseValidationGateResult | null = null;
  private lastMotionDirectionValid: boolean = false;
  private activeSide: 'left' | 'right' = 'left';
  private trackingStatus: 'GOOD' | 'DEGRADED' | 'GRACE_HOLD' = 'GOOD';
  private motionStatus: 'NORMAL' | 'SPIKE_DETECTED' | 'DISPLACEMENT_SPIKE' = 'NORMAL';
  private movementDirection: 'UP' | 'DOWN' | 'STATIONARY' = 'STATIONARY';
  private currentAngularVelocity: number = 0;

  constructor(thresholds: Partial<PushupThresholds> = {}) {
    this.thresholds = { ...DEFAULT_PUSHUP_THRESHOLDS, ...thresholds };
  }

  public reset(): void {
    this.authState = 'NOT_READY';
    this.currentPhase = 'idle';
    this.repCount = 0;
    this.smoothedElbowAngle = null;
    this.previousLandmarks = null;
    this.startAngle = 180;
    this.minAngleReached = 180;
    this.spineAlignmentHistory = [];
    this.consecutiveTransitionFrames = 0;
    this.trajectoryPointCount = 0;
    this.startPositionAcquiredTime = 0;
    this.repStartTime = 0;
    this.bottomReachedTime = 0;
    this.cooldownUntilTime = 0;
    this.lastValidPoseTime = 0;
    this.lastRejectionReason = null;
    this.lastValidation = null;
    this.lastMotionDirectionValid = false;
    this.trackingStatus = 'GOOD';
    this.motionStatus = 'NORMAL';
    this.movementDirection = 'STATIONARY';
    this.currentAngularVelocity = 0;
    this.filter.reset();
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
        armGeometry: this.lastValidation?.gates.armGeometry ?? false,
        hipGeometry: this.lastValidation?.gates.hipGeometry ?? false,
        lowerBodyVisible: this.lastValidation?.gates.lowerBodyVisible ?? false,
        confidenceValid: this.lastValidation?.gates.confidenceValid ?? false,
        temporalStability: isArmed,
        motionDirection: this.lastMotionDirectionValid,
      },
      stabilityProgressMs,
      requiredStabilityMs: this.thresholds.requiredStabilityMs,
      lastRejectionReason: this.lastRejectionReason,
      activeRepDurationMs: this.repStartTime > 0 ? Math.max(0, now - this.repStartTime) : undefined,
      smoothedAngle: this.smoothedElbowAngle ? Math.round(this.smoothedElbowAngle) : undefined,
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
      lockoutAngle,
      depthAngle,
      requiredStabilityMs,
      minRepDurationMs,
      maxRepDurationMs,
      minBottomHoldMs,
      minRangeOfMotion,
      hysteresisMargin,
      maxAngularVelocityDegPerSec,
      maxFrameAngleDeltaDeg,
      maxLandmarkDisplacement,
    } = this.thresholds;

    // 1. Check for sufficient landmark array
    const hasRawLandmarks = Boolean(rawLandmarks && rawLandmarks.length >= 33);
    if (!hasRawLandmarks) {
      this.cancelRepCandidate('Step back so your full body is in the camera frame.');
      return this.buildResult(180, 180, null, null, false);
    }

    // 2. Whole-Body Landmark Displacement Spike Check
    this.motionStatus = 'NORMAL';
    if (this.previousLandmarks) {
      const dispCheck = checkLandmarkDisplacementSpike(rawLandmarks, this.previousLandmarks, maxLandmarkDisplacement);
      if (dispCheck.isSpike) {
        this.motionStatus = 'DISPLACEMENT_SPIKE';
        this.lastRejectionReason = `Sudden camera/landmark jump (${dispCheck.avgDisplacement.toFixed(2)})`;
        this.previousLandmarks = rawLandmarks;
        return this.buildResult(this.smoothedElbowAngle ?? 180, 180, null, null, false);
      }
    }
    this.previousLandmarks = rawLandmarks;

    // 3. Temporal smoothing & Pose validation
    const landmarks = this.filter.smooth(rawLandmarks);
    const validation = validatePushupPose(landmarks, 0.4);
    this.lastValidation = validation;
    this.activeSide = validation.activeSide;

    const isLeft = validation.activeSide !== 'right';
    const shoulderIdx = isLeft ? PoseLandmarkIndex.LEFT_SHOULDER : PoseLandmarkIndex.RIGHT_SHOULDER;
    const elbowIdx = isLeft ? PoseLandmarkIndex.LEFT_ELBOW : PoseLandmarkIndex.RIGHT_ELBOW;
    const wristIdx = isLeft ? PoseLandmarkIndex.LEFT_WRIST : PoseLandmarkIndex.RIGHT_WRIST;
    const hipIdx = isLeft ? PoseLandmarkIndex.LEFT_HIP : PoseLandmarkIndex.RIGHT_HIP;
    const ankleIdx = isLeft ? PoseLandmarkIndex.LEFT_ANKLE : PoseLandmarkIndex.RIGHT_ANKLE;

    // Extract angles
    const rawElbowAngle = calculateAngle(landmarks[shoulderIdx], landmarks[elbowIdx], landmarks[wristIdx]);
    const spineAngle = calculateAngle(landmarks[shoulderIdx], landmarks[hipIdx], landmarks[ankleIdx]);

    let currentElbowAngle = this.smoothedElbowAngle ?? rawElbowAngle;
    let feedback: FormFeedback | null = null;
    let newRepCompleted: RepEvent | null = null;

    // 4. Instantaneous Velocity Spike Filter
    if (validation.valid) {
      this.lastValidPoseTime = timestamp;
      this.trackingStatus = 'GOOD';

      const latestSample = this.motionHistory.getLatestSample();
      if (latestSample) {
        const rawDelta = Math.abs(rawElbowAngle - latestSample.angle);
        const dt = Math.max(15, timestamp - latestSample.timestamp);
        const instVelocity = (rawDelta / (dt / 1000));
        this.currentAngularVelocity = instVelocity;

        if (rawDelta > maxFrameAngleDeltaDeg && dt <= 70) {
          this.motionStatus = 'SPIKE_DETECTED';
          this.lastRejectionReason = `Sudden motion spike (${rawDelta.toFixed(0)}° jump)`;
          return this.buildResult(latestSample.angle, spineAngle, null, null, true);
        }

        if (instVelocity > maxAngularVelocityDegPerSec) {
          this.motionStatus = 'SPIKE_DETECTED';
          this.lastRejectionReason = `Excessive angular velocity (${instVelocity.toFixed(0)}°/s)`;
          return this.buildResult(latestSample.angle, spineAngle, null, null, true);
        }
      }

      currentElbowAngle = rawElbowAngle;
      this.motionHistory.push(timestamp, currentElbowAngle);
    } else {
      const dropoutMs = timestamp - this.lastValidPoseTime;
      const latestSample = this.motionHistory.getLatestSample();
      if (this.authState === 'TRACKING_REP' && dropoutMs <= 500 && latestSample) {
        this.trackingStatus = 'GRACE_HOLD';
        currentElbowAngle = latestSample.angle;
      } else {
        this.trackingStatus = 'DEGRADED';
        if (this.authState === 'TRACKING_REP') {
          this.cancelRepCandidate(validation.failureReasons[0] || 'Plank alignment broken');
        } else {
          this.authState = 'NOT_READY';
          this.currentPhase = 'idle';
          this.startPositionAcquiredTime = 0;
        }

        return this.buildResult(
          currentElbowAngle,
          spineAngle,
          {
            id: `fb-pose-${Math.floor(timestamp / 2000)}`,
            type: 'warning',
            message: validation.failureReasons[0] || 'Assume a horizontal plank in side view.',
            timestamp,
          },
          null,
          false
        );
      }
    }

    // 5. Kinematic Direction & Trend
    const trend = this.motionHistory.getTrend(250);
    if (trend.angularVelocity < -10 || trend.isDecreasing) {
      this.movementDirection = 'DOWN'; // Elbow closing = descending
    } else if (trend.angularVelocity > 10 || trend.isIncreasing) {
      this.movementDirection = 'UP'; // Elbow opening = ascending
    } else {
      this.movementDirection = 'STATIONARY';
    }

    // Check spine alignment feedback
    if (validation.valid && spineAngle < this.thresholds.minBodyAlignmentAngle && spineAngle > 80) {
      feedback = {
        id: `fb-spine-${Math.floor(timestamp / 2000)}`,
        type: 'warning',
        message: 'Keep your core braced in a straight line; avoid sagging hips.',
        timestamp,
      };
    }

    // 6. State Machine
    if (this.authState === 'COOLDOWN') {
      if (timestamp >= this.cooldownUntilTime) {
        this.authState = 'EXERCISE_ARMED';
        this.currentPhase = 'ready';
        this.startAngle = currentElbowAngle;
        this.consecutiveTransitionFrames = 0;
        this.trajectoryPointCount = 0;
      }
    } else if (this.authState === 'NOT_READY') {
      const isLockoutPose = currentElbowAngle >= lockoutAngle - 10;
      if (isLockoutPose && validation.valid) {
        this.authState = 'ACQUIRING_START_POSITION';
        this.startPositionAcquiredTime = timestamp;
        this.currentPhase = 'idle';
      }
    } else if (this.authState === 'ACQUIRING_START_POSITION') {
      const isLockoutPose = currentElbowAngle >= lockoutAngle - 10;
      if (!isLockoutPose || !validation.valid) {
        this.authState = 'NOT_READY';
        this.startPositionAcquiredTime = 0;
      } else {
        const heldDuration = timestamp - this.startPositionAcquiredTime;
        if (heldDuration >= requiredStabilityMs) {
          this.authState = 'EXERCISE_ARMED';
          this.currentPhase = 'ready';
          this.startAngle = currentElbowAngle;
          this.consecutiveTransitionFrames = 0;
          this.trajectoryPointCount = 0;
        }
      }
    } else if (this.authState === 'EXERCISE_ARMED' || this.authState === 'TRACKING_REP') {
      switch (this.currentPhase) {
        case 'ready': {
          this.startAngle = Math.max(this.startAngle, currentElbowAngle);

          const isAngleDecreasing = currentElbowAngle < lockoutAngle - hysteresisMargin;
          if (isAngleDecreasing) {
            this.consecutiveTransitionFrames++;
            if (this.consecutiveTransitionFrames >= 1) {
              this.currentPhase = 'descending';
              this.authState = 'TRACKING_REP';
              this.repStartTime = timestamp;
              this.minAngleReached = currentElbowAngle;
              this.spineAlignmentHistory = [spineAngle];
              this.lastMotionDirectionValid = true;
              this.consecutiveTransitionFrames = 0;
              this.trajectoryPointCount = 1;
            }
          } else {
            this.consecutiveTransitionFrames = 0;
          }
          break;
        }

        case 'descending': {
          this.minAngleReached = Math.min(this.minAngleReached, currentElbowAngle);
          this.spineAlignmentHistory.push(spineAngle);
          this.trajectoryPointCount++;

          if (timestamp - this.repStartTime > 4500) {
            this.cancelRepCandidate('Rep timeout: descent took too long');
            break;
          }

          if (currentElbowAngle > this.minAngleReached + 25 && this.minAngleReached > depthAngle + 15) {
            this.cancelRepCandidate('Insufficient depth: returned to top before reaching 90° elbow bend');
            this.currentPhase = 'ready';
            this.authState = 'EXERCISE_ARMED';
            this.startAngle = currentElbowAngle;
            feedback = {
              id: `fb-depth-${Math.floor(timestamp / 2000)}`,
              type: 'warning',
              message: 'Descend lower until elbows reach 90 degrees.',
              timestamp,
            };
            break;
          }

          if (currentElbowAngle <= depthAngle) {
            this.currentPhase = 'bottom';
            this.bottomReachedTime = timestamp;
            this.lastMotionDirectionValid = true;
            this.consecutiveTransitionFrames = 0;
            this.trajectoryPointCount++;
          }
          break;
        }

        case 'bottom': {
          this.minAngleReached = Math.min(this.minAngleReached, currentElbowAngle);
          this.spineAlignmentHistory.push(spineAngle);
          this.trajectoryPointCount++;

          const bottomHoldDuration = timestamp - this.bottomReachedTime;
          const isAngleOpening = currentElbowAngle > depthAngle + hysteresisMargin;

          if (bottomHoldDuration >= minBottomHoldMs && isAngleOpening) {
            this.currentPhase = 'ascending';
            this.lastMotionDirectionValid = true;
            this.consecutiveTransitionFrames = 0;
            this.trajectoryPointCount++;
          }
          break;
        }

        case 'ascending': {
          this.spineAlignmentHistory.push(spineAngle);
          this.trajectoryPointCount++;

          if (timestamp - this.repStartTime > maxRepDurationMs) {
            this.cancelRepCandidate('Rep timeout: rep duration exceeded maximum limit');
            break;
          }

          if (currentElbowAngle >= lockoutAngle) {
            const totalRepDuration = timestamp - this.repStartTime;
            const totalROM = this.startAngle - this.minAngleReached;

            const isDurationValid = totalRepDuration >= minRepDurationMs && totalRepDuration <= maxRepDurationMs;
            const isROMValid = totalROM >= minRangeOfMotion;
            const isDepthValid = this.minAngleReached <= depthAngle + 5;
            const hasTrajectoryEvidence = this.trajectoryPointCount >= 4;

            if (isDurationValid && isROMValid && isDepthValid && hasTrajectoryEvidence) {
              this.repCount++;

              const avgSpine = this.spineAlignmentHistory.reduce((a, b) => a + b, 0) / Math.max(1, this.spineAlignmentHistory.length);
              const spineScore = Math.max(50, Math.min(100, (avgSpine / 175) * 100));
              const depthScore = this.minAngleReached <= 85 ? 100 : (90 / Math.max(1, this.minAngleReached)) * 100;
              const formScore = Math.min(100, Math.max(50, Math.round(spineScore * 0.4 + depthScore * 0.6)));

              newRepCompleted = {
                repNumber: this.repCount,
                durationMs: totalRepDuration,
                formScore,
                timestamp,
                inflectionAngle: this.minAngleReached,
              };

              this.currentPhase = 'rep_counted';
              this.authState = 'COOLDOWN';
              this.cooldownUntilTime = timestamp + 150;
              this.minAngleReached = 180;
              this.startAngle = 180;
              this.spineAlignmentHistory = [];
              this.repStartTime = 0;
              this.consecutiveTransitionFrames = 0;
              this.trajectoryPointCount = 0;
            } else {
              let reason = 'Rep rejected: ';
              if (!isDurationValid) reason += `duration (${totalRepDuration}ms) unnatural; `;
              if (!isROMValid) reason += `insufficient range of motion (${totalROM.toFixed(0)}° < ${minRangeOfMotion}°); `;
              if (!isDepthValid) reason += `insufficient depth (${this.minAngleReached.toFixed(0)}° > ${depthAngle}°); `;
              if (!hasTrajectoryEvidence) reason += 'insufficient continuous trajectory points; ';
              this.cancelRepCandidate(reason);
              this.currentPhase = 'ready';
              this.authState = 'EXERCISE_ARMED';
              this.startAngle = currentElbowAngle;
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

    return this.buildResult(currentElbowAngle, spineAngle, feedback, newRepCompleted, validation.valid || this.trackingStatus === 'GRACE_HOLD');
  }

  private cancelRepCandidate(reason: string): void {
    this.lastRejectionReason = reason;
    this.repStartTime = 0;
    this.minAngleReached = 180;
    this.spineAlignmentHistory = [];
    this.lastMotionDirectionValid = false;
    this.consecutiveTransitionFrames = 0;
    this.trajectoryPointCount = 0;
    this.authState = 'NOT_READY';
    this.currentPhase = 'idle';
    this.startPositionAcquiredTime = 0;
  }

  private buildResult(
    primaryAngle: number,
    secondaryAngle: number,
    feedback: FormFeedback | null,
    newRepCompleted: RepEvent | null,
    landmarksValid: boolean
  ): ExerciseDetectorResult {
    let progress = 0;
    const range = this.thresholds.lockoutAngle - this.thresholds.depthAngle;

    if (this.currentPhase === 'descending') {
      progress = Math.max(0, Math.min(50, ((this.thresholds.lockoutAngle - primaryAngle) / range) * 50));
    } else if (this.currentPhase === 'bottom') {
      progress = 50;
    } else if (this.currentPhase === 'ascending') {
      progress = Math.max(50, Math.min(100, 50 + ((primaryAngle - this.thresholds.depthAngle) / range) * 50));
    } else if (this.currentPhase === 'rep_counted' || this.currentPhase === 'ready') {
      progress = 0;
    }

    return {
      currentPhase: this.currentPhase,
      progressPercent: Math.round(progress),
      primaryAngle: Math.round(primaryAngle),
      secondaryAngle: Math.round(secondaryAngle),
      feedback,
      newRepCompleted,
      landmarksValid,
      telemetry: this.getTelemetry(),
    };
  }
}
