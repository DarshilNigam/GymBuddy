import { DetectionState, PoseFrameData } from '../../types/pose';

export type PoseFrameCallback = (frameData: PoseFrameData, detectionState: DetectionState) => void;
export type PoseErrorCallback = (error: Error | string) => void;

export interface IPoseEngine {
  init(): Promise<void>;
  start(videoElement: HTMLVideoElement, onFrame: PoseFrameCallback): Promise<void>;
  stop(): Promise<void>;
  destroy?(): Promise<void>;
  isReady(): boolean;
  getDetectionState(): DetectionState;
  onError?: (callback: PoseErrorCallback) => void;
  setTargetFPS?(fps: number): void;
}

/**
 * Placeholder Pose Engine implementation for offline or test environments.
 */
export class PlaceholderPoseEngine implements IPoseEngine {
  private running: boolean = false;
  private animFrameId: number | null = null;
  private onFrameCallback: PoseFrameCallback | null = null;
  private errorCallback: PoseErrorCallback | null = null;
  private state: DetectionState = {
    isModelLoaded: false,
    isModelLoading: false,
    isPersonInFrame: false,
    isPostureValid: false,
    fps: 0,
    latencyMs: 0,
    activeSide: 'left',
    calibrationScore: 0,
    error: null,
  };

  public async init(): Promise<void> {
    this.state.isModelLoading = true;
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.state.isModelLoaded = true;
    this.state.isModelLoading = false;
  }

  public async start(videoElement: HTMLVideoElement, onFrame: PoseFrameCallback): Promise<void> {
    this.running = true;
    this.onFrameCallback = onFrame;
    this.state.isPersonInFrame = true;
    this.state.isPostureValid = true;
    this.state.calibrationScore = 95;

    let lastTime = performance.now();
    let frameCount = 0;

    const loop = (currentTime: number) => {
      if (!this.running) return;

      frameCount++;
      const delta = currentTime - lastTime;
      if (delta >= 1000) {
        this.state.fps = Math.round((frameCount * 1000) / delta);
        this.state.latencyMs = Math.round(1000 / Math.max(1, this.state.fps));
        frameCount = 0;
        lastTime = currentTime;
      }

      if (this.onFrameCallback && videoElement.readyState >= 2) {
        this.onFrameCallback(
          {
            timestamp: currentTime,
            landmarks: [],
            detected: true,
            confidence: 0.95,
          },
          this.state
        );
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public async stop(): Promise<void> {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public async destroy(): Promise<void> {
    await this.stop();
    this.onFrameCallback = null;
    this.errorCallback = null;
  }

  public isReady(): boolean {
    return this.state.isModelLoaded;
  }

  public getDetectionState(): DetectionState {
    return { ...this.state };
  }

  public onError(callback: PoseErrorCallback): void {
    this.errorCallback = callback;
  }
}
