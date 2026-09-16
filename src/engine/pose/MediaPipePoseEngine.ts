import { FilesetResolver, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { DetectionState, Landmark, PoseFrameData, PoseLandmarkIndex } from '../../types/pose';
import { IPoseEngine, PoseErrorCallback, PoseFrameCallback } from './poseEngineInterface';

export interface MediaPipePoseEngineOptions {
  modelType?: 'lite' | 'full' | 'heavy';
  delegate?: 'GPU' | 'CPU';
  targetFPS?: number;
  minPoseDetectionConfidence?: number;
  minPosePresenceConfidence?: number;
  minTrackingConfidence?: number;
}

const MODEL_ASSET_PATHS = {
  lite: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  full: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
  heavy: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
};

const WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';

/**
 * Real MediaPipe Pose Engine implementation using @mediapipe/tasks-vision.
 * Runs in-browser computer vision on HTMLVideoElement frames.
 */
export class MediaPipePoseEngine implements IPoseEngine {
  private landmarker: PoseLandmarker | null = null;
  private options: MediaPipePoseEngineOptions;
  private running: boolean = false;
  private animFrameId: number | null = null;
  private onFrameCallback: PoseFrameCallback | null = null;
  private errorCallback: PoseErrorCallback | null = null;

  private isInferenceRunning: boolean = false;
  private lastInferenceTime: number = 0;
  private lastVideoTime: number = -1;
  private lastTimestampMs: number = 0;
  private throttleIntervalMs: number = 50; // Default ~20 FPS for inference

  // Telemetry
  private frameCount: number = 0;
  private fpsLastTimestamp: number = 0;
  private currentFps: number = 0;
  private currentLatencyMs: number = 0;

  private state: DetectionState = {
    isModelLoaded: false,
    isModelLoading: false,
    isPersonInFrame: false,
    isPostureValid: false,
    fps: 0,
    latencyMs: 0,
    activeSide: 'front',
    calibrationScore: 0,
    error: null,
  };

  constructor(options: MediaPipePoseEngineOptions = {}) {
    this.options = {
      modelType: 'lite',
      delegate: 'GPU',
      targetFPS: 20,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      ...options,
    };
    if (this.options.targetFPS) {
      this.throttleIntervalMs = Math.max(16, Math.round(1000 / this.options.targetFPS));
    }
  }

  public setTargetFPS(fps: number): void {
    this.options.targetFPS = fps;
    this.throttleIntervalMs = Math.max(16, Math.round(1000 / fps));
  }

  public onError(callback: PoseErrorCallback): void {
    this.errorCallback = callback;
  }

  /**
   * Initializes the MediaPipe vision wasm resolver and creates the PoseLandmarker instance.
   */
  public async init(): Promise<void> {
    if (this.landmarker) {
      this.state.isModelLoaded = true;
      return;
    }

    this.state.isModelLoading = true;
    this.state.error = null;

    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_CDN_URL);

      const modelAssetPath = MODEL_ASSET_PATHS[this.options.modelType || 'lite'];

      try {
        // Attempt with requested delegate (default GPU)
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: this.options.delegate || 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: this.options.minPoseDetectionConfidence || 0.5,
          minPosePresenceConfidence: this.options.minPosePresenceConfidence || 0.5,
          minTrackingConfidence: this.options.minTrackingConfidence || 0.5,
        });
      } catch (gpuErr) {
        console.warn('MediaPipe GPU initialization failed, falling back to CPU:', gpuErr);
        if (this.landmarker) {
          try {
            (this.landmarker as PoseLandmarker).close();
          } catch (_) {}
          this.landmarker = null;
        }
        // Fallback to CPU if GPU / WebGL context fails
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: this.options.minPoseDetectionConfidence || 0.5,
          minPosePresenceConfidence: this.options.minPosePresenceConfidence || 0.5,
          minTrackingConfidence: this.options.minTrackingConfidence || 0.5,
        });
      }

      this.state.isModelLoaded = true;
      this.state.isModelLoading = false;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.state.isModelLoading = false;
      this.state.isModelLoaded = false;
      this.state.error = errorMsg;
      console.error('MediaPipe PoseLandmarker initialization error:', err);
      if (this.errorCallback) {
        this.errorCallback(err instanceof Error ? err : new Error(errorMsg));
      }
      throw err;
    }
  }

  private currentVideoElement: HTMLVideoElement | null = null;

  public updateVideoElement(videoElement: HTMLVideoElement): void {
    this.currentVideoElement = videoElement;
    this.lastVideoTime = -1;
  }

  /**
   * Starts the real-time frame loop reading from the provided videoElement.
   */
  public async start(videoElement: HTMLVideoElement, onFrame: PoseFrameCallback): Promise<void> {
    if (!this.landmarker) {
      await this.init();
    }

    this.currentVideoElement = videoElement;

    // Cancel any existing loop if active before starting on new video element
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.running = true;
    this.onFrameCallback = onFrame;
    this.fpsLastTimestamp = performance.now();
    this.frameCount = 0;
    this.lastVideoTime = -1;

    const processLoop = () => {
      if (!this.running) return;

      const video = this.currentVideoElement || videoElement;
      if (!video) return;

      const now = performance.now();

      // Measure real processing FPS
      this.frameCount++;
      const fpsDelta = now - this.fpsLastTimestamp;
      if (fpsDelta >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / fpsDelta);
        this.state.fps = this.currentFps;
        this.frameCount = 0;
        this.fpsLastTimestamp = now;
      }

      // Check if video element is still attached to the DOM and actively streaming
      const isVideoConnected = typeof video.isConnected === 'boolean' ? video.isConnected : true;
      const isVideoReady =
        isVideoConnected &&
        video.readyState >= 2 &&
        !video.paused &&
        !video.ended &&
        video.currentTime > 0;

      // Throttle inference according to target interval to avoid overworking the CPU/GPU
      const isTimeForInference = now - this.lastInferenceTime >= this.throttleIntervalMs;
      const isNewFrame = video.currentTime !== this.lastVideoTime;

      if (isVideoReady && isTimeForInference && isNewFrame && !this.isInferenceRunning && this.landmarker) {
        this.isInferenceRunning = true;
        this.lastVideoTime = video.currentTime;
        this.lastInferenceTime = now;

        const startTime = performance.now();
        const timestampMs = Math.max(now, this.lastTimestampMs + 1);
        this.lastTimestampMs = timestampMs;
        let result: PoseLandmarkerResult | null = null;

        try {
          // detectForVideo synchronously processes the frame in MediaPipe wasm
          result = this.landmarker.detectForVideo(video, timestampMs);
          this.currentLatencyMs = Math.round(performance.now() - startTime);
          this.state.latencyMs = this.currentLatencyMs;
        } catch (inferenceErr) {
          console.warn('Pose inference frame error:', inferenceErr);
        } finally {
          this.isInferenceRunning = false;
        }

        // Process landmarks
        if (result && result.landmarks && result.landmarks.length > 0) {
          const rawLandmarks = result.landmarks[0]; // First detected person
          const convertedLandmarks: Landmark[] = rawLandmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility !== undefined ? lm.visibility : 1.0,
          }));

          const hasKeyPoints = convertedLandmarks.length >= 33;
          this.state.isPersonInFrame = hasKeyPoints;

          // Determine orientation & visibility
          if (hasKeyPoints) {
            const leftVis =
              ((convertedLandmarks[PoseLandmarkIndex.LEFT_SHOULDER]?.visibility ?? 0) +
                (convertedLandmarks[PoseLandmarkIndex.LEFT_HIP]?.visibility ?? 0) +
                (convertedLandmarks[PoseLandmarkIndex.LEFT_ANKLE]?.visibility ?? 0)) / 3;

            const rightVis =
              ((convertedLandmarks[PoseLandmarkIndex.RIGHT_SHOULDER]?.visibility ?? 0) +
                (convertedLandmarks[PoseLandmarkIndex.RIGHT_HIP]?.visibility ?? 0) +
                (convertedLandmarks[PoseLandmarkIndex.RIGHT_ANKLE]?.visibility ?? 0)) / 3;

            if (Math.abs(leftVis - rightVis) > 0.12) {
              this.state.activeSide = leftVis > rightVis ? 'left' : 'right';
            } else {
              this.state.activeSide = 'front';
            }

            const avgCoreVis = (leftVis + rightVis) / 2;
            this.state.calibrationScore = Math.min(100, Math.round(avgCoreVis * 100));
            this.state.isPostureValid = avgCoreVis >= 0.5;
          }

          if (this.onFrameCallback) {
            this.onFrameCallback(
              {
                timestamp: now,
                landmarks: convertedLandmarks,
                detected: true,
                confidence: this.state.calibrationScore / 100,
              },
              { ...this.state }
            );
          }
        } else {
          // No person detected in current frame
          this.state.isPersonInFrame = false;
          this.state.isPostureValid = false;
          this.state.calibrationScore = 0;

          if (this.onFrameCallback) {
            this.onFrameCallback(
              {
                timestamp: now,
                landmarks: [],
                detected: false,
                confidence: 0,
              },
              { ...this.state }
            );
          }
        }
      } else if (!isVideoReady && this.state.isPersonInFrame) {
        // Video paused or detached: immediately clear tracking state
        this.state.isPersonInFrame = false;
        this.state.fps = 0;
        this.state.calibrationScore = 0;
        this.state.isPostureValid = false;

        if (this.onFrameCallback) {
          this.onFrameCallback(
            {
              timestamp: now,
              landmarks: [],
              detected: false,
              confidence: 0,
            },
            { ...this.state }
          );
        }
      }

      this.animFrameId = requestAnimationFrame(processLoop);
    };

    this.animFrameId = requestAnimationFrame(processLoop);
  }

  /**
   * Stops the active frame processing loop and resets tracking state.
   */
  public async stop(): Promise<void> {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.isInferenceRunning = false;
    this.currentVideoElement = null;
    this.state.isPersonInFrame = false;
    this.state.fps = 0;
    this.state.calibrationScore = 0;
    this.state.isPostureValid = false;

    if (this.onFrameCallback) {
      this.onFrameCallback(
        {
          timestamp: performance.now(),
          landmarks: [],
          detected: false,
          confidence: 0,
        },
        { ...this.state }
      );
    }
  }

  /**
   * Cleans up all resources, stops the loop, and closes the MediaPipe landmarker.
   */
  public async destroy(): Promise<void> {
    await this.stop();
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch (e) {
        console.warn('Error closing MediaPipe landmarker:', e);
      }
      this.landmarker = null;
    }
    this.onFrameCallback = null;
    this.errorCallback = null;
    this.state.isModelLoaded = false;
  }

  public isReady(): boolean {
    return this.state.isModelLoaded && this.landmarker !== null;
  }

  public getDetectionState(): DetectionState {
    return { ...this.state };
  }
}
