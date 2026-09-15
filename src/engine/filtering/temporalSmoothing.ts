import { Landmark } from '../../types/pose';

/**
 * Exponential Moving Average filter for multi-point landmark jitter reduction.
 */
export class LandmarkTemporalFilter {
  private alpha: number;
  private prevLandmarks: Landmark[] | null = null;

  constructor(alpha: number = 0.65) {
    this.alpha = alpha;
  }

  public setAlpha(alpha: number) {
    this.alpha = Math.max(0.05, Math.min(1.0, alpha));
  }

  public smooth(currentLandmarks: Landmark[]): Landmark[] {
    if (!currentLandmarks || currentLandmarks.length === 0) {
      return currentLandmarks;
    }

    if (!this.prevLandmarks || this.prevLandmarks.length !== currentLandmarks.length) {
      this.prevLandmarks = currentLandmarks.map((lm) => ({ ...lm }));
      return currentLandmarks;
    }

    const smoothed: Landmark[] = currentLandmarks.map((lm, i) => {
      const prev = this.prevLandmarks![i];
      if (!lm) return prev;
      if (!prev) return lm;

      const smoothedX = this.alpha * lm.x + (1 - this.alpha) * prev.x;
      const smoothedY = this.alpha * lm.y + (1 - this.alpha) * prev.y;
      const smoothedZ =
        lm.z !== undefined && prev.z !== undefined
          ? this.alpha * lm.z + (1 - this.alpha) * prev.z
          : lm.z;
      const smoothedVis =
        lm.visibility !== undefined && prev.visibility !== undefined
          ? this.alpha * lm.visibility + (1 - this.alpha) * prev.visibility
          : lm.visibility;

      return {
        x: smoothedX,
        y: smoothedY,
        z: smoothedZ,
        visibility: smoothedVis,
      };
    });

    this.prevLandmarks = smoothed;
    return smoothed;
  }

  public reset() {
    this.prevLandmarks = null;
  }
}
