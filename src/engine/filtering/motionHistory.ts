import { Landmark, PoseLandmarkIndex } from '../../types/pose';

export interface KinematicSample {
  timestamp: number;
  angle: number;
  secondaryAngle?: number;
}

export interface MotionTrendResult {
  angularVelocity: number; // degrees per second (+ is opening/increasing, - is closing/decreasing)
  monotonicity: number; // 0.0 to 1.0 (proportion of consecutive frame deltas agreeing with the dominant direction)
  rangeOfMotion: number; // Max angle - min angle over window
  isDecreasing: boolean;
  isIncreasing: boolean;
  sampleCount: number;
}

export interface MotionSpikeCheckResult {
  isSpike: boolean;
  velocityDegPerSec: number;
  deltaAngle: number;
  reason?: string;
}

/**
 * Sliding window buffer of timestamped kinematic samples for directional motion analysis.
 * Rejects 1-frame spikes, threshold jitter, and discontinuous velocity anomalies.
 */
export class MotionHistory {
  private samples: KinematicSample[] = [];
  private readonly maxWindowMs: number;

  constructor(maxWindowMs: number = 2000) {
    this.maxWindowMs = maxWindowMs;
  }

  public push(timestamp: number, angle: number, secondaryAngle?: number): void {
    this.samples.push({ timestamp, angle, secondaryAngle });
    this.prune(timestamp);
  }

  public clear(): void {
    this.samples = [];
  }

  private prune(currentTimestamp: number): void {
    const cutoff = currentTimestamp - this.maxWindowMs;
    while (this.samples.length > 0 && this.samples[0].timestamp < cutoff) {
      this.samples.shift();
    }
  }

  public getSamples(): KinematicSample[] {
    return [...this.samples];
  }

  public getSampleCount(): number {
    return this.samples.length;
  }

  public getLatestSample(): KinematicSample | null {
    if (this.samples.length === 0) return null;
    return this.samples[this.samples.length - 1];
  }

  public getPreviousSample(): KinematicSample | null {
    if (this.samples.length < 2) return null;
    return this.samples[this.samples.length - 2];
  }

  /**
   * Checks for instantaneous angular velocity spikes between the two most recent samples.
   */
  public checkInstantaneousSpike(
    maxVelocityDegPerSec: number = 700,
    maxDeltaAngleDeg: number = 35,
    minDeltaTimeMs: number = 10
  ): MotionSpikeCheckResult {
    if (this.samples.length < 2) {
      return { isSpike: false, velocityDegPerSec: 0, deltaAngle: 0 };
    }

    const prev = this.samples[this.samples.length - 2];
    const curr = this.samples[this.samples.length - 1];
    const dtMs = Math.max(minDeltaTimeMs, curr.timestamp - prev.timestamp);
    const dAngle = Math.abs(curr.angle - prev.angle);
    const velocity = (dAngle / (dtMs / 1000));

    if (dAngle > maxDeltaAngleDeg && dtMs <= 100) {
      return {
        isSpike: true,
        velocityDegPerSec: Math.round(velocity),
        deltaAngle: Math.round(dAngle),
        reason: `Instantaneous angle jump (${dAngle.toFixed(0)}° in ${dtMs}ms)`,
      };
    }

    if (velocity > maxVelocityDegPerSec) {
      return {
        isSpike: true,
        velocityDegPerSec: Math.round(velocity),
        deltaAngle: Math.round(dAngle),
        reason: `Excessive angular velocity (${velocity.toFixed(0)}°/s > ${maxVelocityDegPerSec}°/s)`,
      };
    }

    return {
      isSpike: false,
      velocityDegPerSec: Math.round(velocity),
      deltaAngle: Math.round(dAngle),
    };
  }

  /**
   * Detects sudden discontinuous angular jumps (> maxJumpDeg within minIntervalMs).
   */
  public hasDiscontinuousJump(maxJumpDeg: number = 45, maxIntervalMs: number = 100): boolean {
    if (this.samples.length < 2) return false;

    for (let i = 1; i < this.samples.length; i++) {
      const prev = this.samples[i - 1];
      const curr = this.samples[i];
      const dt = curr.timestamp - prev.timestamp;
      const dAngle = Math.abs(curr.angle - prev.angle);

      if (dt <= maxIntervalMs && dAngle > maxJumpDeg) {
        return true;
      }
    }
    return false;
  }

  /**
   * Analyzes the directional trend of the angle over the most recent time window.
   */
  public getTrend(windowMs: number = 300): MotionTrendResult {
    if (this.samples.length < 2) {
      return {
        angularVelocity: 0,
        monotonicity: 0,
        rangeOfMotion: 0,
        isDecreasing: false,
        isIncreasing: false,
        sampleCount: this.samples.length,
      };
    }

    const latest = this.samples[this.samples.length - 1];
    const cutoff = latest.timestamp - windowMs;
    const windowSamples = this.samples.filter((s) => s.timestamp >= cutoff);

    if (windowSamples.length < 2) {
      return {
        angularVelocity: 0,
        monotonicity: 0,
        rangeOfMotion: 0,
        isDecreasing: false,
        isIncreasing: false,
        sampleCount: windowSamples.length,
      };
    }

    const first = windowSamples[0];
    const totalDt = Math.max(0.01, (latest.timestamp - first.timestamp) / 1000); // in seconds
    const totalDAngle = latest.angle - first.angle;
    const angularVelocity = totalDAngle / totalDt; // deg/sec

    let minAngle = windowSamples[0].angle;
    let maxAngle = windowSamples[0].angle;
    let agreeingSteps = 0;
    let totalSteps = 0;

    const targetSign = Math.sign(totalDAngle);

    for (let i = 1; i < windowSamples.length; i++) {
      const d = windowSamples[i].angle - windowSamples[i - 1].angle;
      minAngle = Math.min(minAngle, windowSamples[i].angle);
      maxAngle = Math.max(maxAngle, windowSamples[i].angle);

      if (Math.abs(d) > 0.5) {
        totalSteps++;
        if (targetSign !== 0 && Math.sign(d) === targetSign) {
          agreeingSteps++;
        }
      }
    }

    const monotonicity = totalSteps > 0 ? agreeingSteps / totalSteps : 1.0;
    const rangeOfMotion = maxAngle - minAngle;

    return {
      angularVelocity,
      monotonicity,
      rangeOfMotion,
      isDecreasing: angularVelocity < -10 && totalDAngle < -3,
      isIncreasing: angularVelocity > 10 && totalDAngle > 3,
      sampleCount: windowSamples.length,
    };
  }

  /**
   * Computes the total range of motion between two timestamps.
   */
  public getRangeOfMotion(fromTimestamp: number, toTimestamp: number): number {
    const rangeSamples = this.samples.filter(
      (s) => s.timestamp >= fromTimestamp && s.timestamp <= toTimestamp
    );
    if (rangeSamples.length < 2) return 0;

    let minA = rangeSamples[0].angle;
    let maxA = rangeSamples[0].angle;
    for (const s of rangeSamples) {
      if (s.angle < minA) minA = s.angle;
      if (s.angle > maxA) maxA = s.angle;
    }
    return maxA - minA;
  }
}

/**
 * Checks for sudden whole-body landmark displacement spikes (e.g. camera bumps, teleporting landmarks).
 */
export function checkLandmarkDisplacementSpike(
  currentLandmarks: Landmark[],
  previousLandmarks: Landmark[] | null,
  maxAvgDisplacement: number = 0.18
): { isSpike: boolean; avgDisplacement: number; maxDisplacement: number } {
  if (!previousLandmarks || !currentLandmarks || currentLandmarks.length < 33 || previousLandmarks.length < 33) {
    return { isSpike: false, avgDisplacement: 0, maxDisplacement: 0 };
  }

  const keyIndices = [
    PoseLandmarkIndex.LEFT_SHOULDER,
    PoseLandmarkIndex.RIGHT_SHOULDER,
    PoseLandmarkIndex.LEFT_ELBOW,
    PoseLandmarkIndex.RIGHT_ELBOW,
    PoseLandmarkIndex.LEFT_HIP,
    PoseLandmarkIndex.RIGHT_HIP,
    PoseLandmarkIndex.LEFT_KNEE,
    PoseLandmarkIndex.RIGHT_KNEE,
  ];

  let totalDisplacement = 0;
  let count = 0;
  let maxDisplacement = 0;

  for (const idx of keyIndices) {
    const curr = currentLandmarks[idx];
    const prev = previousLandmarks[idx];

    if (curr && prev && (curr.visibility ?? 1) > 0.25 && (prev.visibility ?? 1) > 0.25) {
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      totalDisplacement += dist;
      count++;
      if (dist > maxDisplacement) maxDisplacement = dist;
    }
  }

  const avgDisplacement = count > 0 ? totalDisplacement / count : 0;
  const isSpike = avgDisplacement > maxAvgDisplacement || maxDisplacement > maxAvgDisplacement * 2.2;

  return { isSpike, avgDisplacement, maxDisplacement };
}
