import { useState, useEffect, useRef, useCallback } from 'react';
import { DetectionState, PoseFrameData } from '../types/pose';
import { IPoseEngine } from '../engine/pose/poseEngineInterface';
import { MediaPipePoseEngine, MediaPipePoseEngineOptions } from '../engine/pose/MediaPipePoseEngine';

export interface UsePoseDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  stream?: MediaStream | null;
  engineOptions?: MediaPipePoseEngineOptions;
  onFrame?: (frame: PoseFrameData, state: DetectionState) => void;
}

export interface UsePoseDetectionReturn {
  detectionState: DetectionState;
  isEngineReady: boolean;
  isModelLoading: boolean;
  fps: number;
  latencyMs: number;
  error: string | null;
  engineRef: React.MutableRefObject<IPoseEngine | null>;
}

export function usePoseDetection({
  videoRef,
  isStreaming,
  stream,
  engineOptions,
  onFrame,
}: UsePoseDetectionOptions): UsePoseDetectionReturn {
  const engineRef = useRef<IPoseEngine | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectionState, setDetectionState] = useState<DetectionState>({
    isModelLoaded: false,
    isModelLoading: true,
    isPersonInFrame: false,
    isPostureValid: false,
    fps: 0,
    latencyMs: 0,
    activeSide: 'front',
    calibrationScore: 0,
    error: null,
  });

  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  // Initialize MediaPipe pose engine
  useEffect(() => {
    let isCancelled = false;
    const engine = new MediaPipePoseEngine(engineOptions);
    engineRef.current = engine;

    setIsModelLoading(true);
    setError(null);

    engine.onError?.((err) => {
      if (!isCancelled) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      }
    });

    engine
      .init()
      .then(() => {
        if (!isCancelled) {
          setIsEngineReady(true);
          setIsModelLoading(false);
          setDetectionState(engine.getDetectionState());
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
          setIsModelLoading(false);
          setIsEngineReady(false);
        }
      });

    return () => {
      isCancelled = true;
      engine.destroy?.();
      engineRef.current = null;
    };
  }, []);

  // Handle stream frame lifecycle
  const handleFrame = useCallback((frame: PoseFrameData, state: DetectionState) => {
    setDetectionState({ ...state });
    if (onFrameRef.current) {
      onFrameRef.current(frame, state);
    }
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    const video = videoRef.current;

    if (isStreaming && isEngineReady && engine && video) {
      engine.start(video, handleFrame);
    } else if (!isStreaming && engine) {
      engine.stop();
    }

    return () => {
      if (engine) {
        engine.stop();
      }
    };
  }, [isStreaming, isEngineReady, videoRef, stream, handleFrame]);

  return {
    detectionState,
    isEngineReady,
    isModelLoading,
    fps: detectionState.fps,
    latencyMs: detectionState.latencyMs,
    error,
    engineRef,
  };
}
