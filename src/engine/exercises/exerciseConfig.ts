/**
 * Single source of truth for exercise detector thresholds, timing, and UI guidance.
 * All detectors, calibration checks, HUD overlays, and "Show Me How" guides consume these exact values.
 */

export interface PushupConfig {
  readonly lockoutAngle: number; // e.g. >= 155 deg (full arm extension at top)
  readonly depthAngle: number; // e.g. <= 90 deg (elbow bend at bottom)
  readonly minBodyAlignmentAngle: number; // e.g. >= 142 deg (straight spine line)
  readonly requiredStabilityMs: number; // e.g. 1000ms in stable plank to arm
  readonly minRepDurationMs: number; // e.g. 500ms minimum plausible repetition
  readonly maxRepDurationMs: number; // e.g. 6000ms maximum timeout
  readonly minBottomHoldMs: number; // e.g. 60ms depth inflection hold
  readonly minRangeOfMotion: number; // e.g. 50 deg angular travel
  readonly hysteresisMargin: number; // e.g. 15 deg boundary margin

  // Hardening Anti-Spike & Continuity Parameters
  readonly maxAngularVelocityDegPerSec: number; // e.g. 650 deg/sec
  readonly maxFrameAngleDeltaDeg: number; // e.g. 35 deg jump in single frame
  readonly maxLandmarkDisplacement: number; // e.g. 0.18 normalized distance
  readonly minConsecutiveTransitionFrames: number; // e.g. 2 frames
  readonly spikeHoldDurationMs: number; // e.g. 500ms grace hold during spike
}

export interface SitupConfig {
  /**
   * Primary start/reset angle (Shoulder - Hip - Knee).
   * User lying flat on their back on the mat will measure ~130° - 160°.
   */
  readonly lyingAngle: number; // >= 130 deg (torso flat relative to thighs)

  /**
   * Primary peak upright angle (Shoulder - Hip - Knee).
   * User curled up with chest near knees will measure ~45° - 65°.
   */
  readonly uprightAngle: number; // <= 65 deg (torso curled close to knees)

  /**
   * Minimum acceptable knee flexion angle (Hip - Knee - Ankle).
   * Used for diagnostic guidance and standing rejection.
   */
  readonly minKneeBendAngle: number; // e.g. 50 deg

  /**
   * Maximum acceptable knee flexion angle (Hip - Knee - Ankle).
   * If legs are completely straight (>150°), user is warned to bend knees.
   */
  readonly maxKneeBendAngle: number; // e.g. 150 deg

  /**
   * Time the user must hold the flat starting position to arm the detector.
   */
  readonly requiredStabilityMs: number; // e.g. 600ms

  /**
   * Minimum plausible repetition duration (rejects single-frame spikes / artifacts).
   */
  readonly minRepDurationMs: number; // e.g. 400ms

  /**
   * Maximum plausible repetition duration before timeout.
   */
  readonly maxRepDurationMs: number; // e.g. 6000ms

  /**
   * Time user must pause at peak flexion before initiating return.
   */
  readonly minPeakHoldMs: number; // e.g. 50ms

  /**
   * Minimum torso angular travel required between start lying angle and peak upright angle.
   */
  readonly minRangeOfMotion: number; // e.g. 45 deg

  /**
   * Hysteresis margin to prevent flickering around transition boundaries.
   */
  readonly hysteresisMargin: number; // e.g. 12 deg

  /**
   * Minimum landmark visibility confidence for the primary side (Shoulder, Hip, Knee).
   */
  readonly minConfidence: number; // e.g. 0.25

  /**
   * Maximum duration (in ms) that tracking degradation/loss can be tolerated
   * by holding state before the repetition is canceled.
   */
  readonly maxDropoutDurationMs: number; // e.g. 700ms (approx 15-20 frames at 30fps)

  /**
   * Exponential smoothing factor for primary angle (0 = max smooth, 1 = no smooth).
   */
  readonly angleSmoothingAlpha: number; // e.g. 0.65

  // Hardening Anti-Spike & Continuity Parameters
  readonly maxAngularVelocityDegPerSec: number; // e.g. 750 deg/sec
  readonly maxFrameAngleDeltaDeg: number; // e.g. 38 deg jump in single frame
  readonly maxLandmarkDisplacement: number; // e.g. 0.20 normalized distance
  readonly minConsecutiveTransitionFrames: number; // e.g. 2 frames
  readonly spikeHoldDurationMs: number; // e.g. 500ms grace hold during spike
}

export const PUSHUP_CONFIG: PushupConfig = {
  lockoutAngle: 155,
  depthAngle: 90,
  minBodyAlignmentAngle: 142,
  requiredStabilityMs: 1000,
  minRepDurationMs: 400,
  maxRepDurationMs: 6000,
  minBottomHoldMs: 60,
  minRangeOfMotion: 50,
  hysteresisMargin: 15,
  maxAngularVelocityDegPerSec: 650,
  maxFrameAngleDeltaDeg: 35,
  maxLandmarkDisplacement: 0.18,
  minConsecutiveTransitionFrames: 2,
  spikeHoldDurationMs: 500,
};

export const SITUP_CONFIG: SitupConfig = {
  lyingAngle: 130, // Torso flat on back (Shoulder-Hip-Knee >= 130°)
  uprightAngle: 65, // Upright peak (Shoulder-Hip-Knee <= 65°)
  minKneeBendAngle: 50,
  maxKneeBendAngle: 150,
  requiredStabilityMs: 600, // 600ms hold to arm (fast and responsive)
  minRepDurationMs: 400, // 400ms min duration
  maxRepDurationMs: 6000, // 6.0s max duration
  minPeakHoldMs: 50, // 50ms hold at peak
  minRangeOfMotion: 45, // 45° min angular travel
  hysteresisMargin: 12, // 12° margin
  minConfidence: 0.25, // Robust threshold tolerant of limb movement
  maxDropoutDurationMs: 700, // 700ms grace window for temporary occlusions
  angleSmoothingAlpha: 0.65, // Balanced temporal filter
  maxAngularVelocityDegPerSec: 750,
  maxFrameAngleDeltaDeg: 38,
  maxLandmarkDisplacement: 0.20,
  minConsecutiveTransitionFrames: 2,
  spikeHoldDurationMs: 500,
};
