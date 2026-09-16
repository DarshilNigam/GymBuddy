import { useState, useEffect, useRef, useCallback } from 'react';

export type CameraPermissionStatus = 'idle' | 'prompting' | 'granted' | 'denied' | 'unsupported' | 'error';

export interface UseCameraOptions {
  idealFacingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  autoStart?: boolean;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  permissionStatus: CameraPermissionStatus;
  errorMessage: string | null;
  isStreaming: boolean;
  isMirrored: boolean;
  activeDeviceId: string | null;
  availableDevices: MediaDeviceInfo[];
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  toggleMirror: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
}

/**
 * Camera hook with correct lifecycle management.
 * Uses a ref for the stream to avoid dependency cycles in useCallback/useEffect.
 * The cleanup function on unmount always stops the current stream, preventing leaks
 * when navigating away from a page that started the camera.
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    idealFacingMode = 'user',
    width = 1280,
    height = 720,
    autoStart = false,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(idealFacingMode === 'user');
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const deviceIdRef = useRef<string | null>(null);

  const updateDeviceList = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoInputs);
    } catch (e) {
      console.warn('Could not enumerate video devices:', e);
    }
  }, []);

  // stopCamera reads from ref, so it has NO state dependencies and is stable across renders
  const stopCamera = useCallback(() => {
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionStatus('unsupported');
      setErrorMessage('Camera access is not supported in this browser environment or insecure origin.');
      return false;
    }

    setPermissionStatus('prompting');
    setErrorMessage(null);

    // Stop any existing stream before opening a new one
    const existingStream = streamRef.current;
    if (existingStream) {
      existingStream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const currentDeviceId = deviceIdRef.current;
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: currentDeviceId
          ? { deviceId: { exact: currentDeviceId }, width: { ideal: width }, height: { ideal: height } }
          : {
              facingMode: idealFacingMode,
              width: { ideal: width },
              height: { ideal: height },
            },
      };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr: any) {
        // Fallback to generic video constraint if specific width/height/facingMode is rejected by device
        if (
          constraintErr.name === 'OverconstrainedError' ||
          constraintErr.name === 'ConstraintNotSatisfiedError' ||
          constraintErr.name === 'NotFoundError'
        ) {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        } else {
          throw constraintErr;
        }
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionStatus('granted');
      setIsStreaming(true);

      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const resolvedId = videoTrack.getSettings().deviceId || null;
        deviceIdRef.current = resolvedId;
        setActiveDeviceId(resolvedId);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn('Video auto-play warning:', err);
        }
      }

      await updateDeviceList();
      return true;
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      console.error('Camera access error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in browser settings to continue.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionStatus('error');
        setErrorMessage('No camera device found on this system. Please connect a webcam.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setPermissionStatus('error');
        setErrorMessage('Camera is currently in use by another application. Please close other apps using the camera.');
      } else {
        setPermissionStatus('error');
        setErrorMessage(error.message || 'Unable to access camera.');
      }
      setIsStreaming(false);
      return false;
    }
  }, [height, idealFacingMode, updateDeviceList, width]);

  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  const switchCamera = useCallback(
    async (deviceId: string) => {
      deviceIdRef.current = deviceId;
      setActiveDeviceId(deviceId);
      // If currently streaming, restart with the new device
      if (streamRef.current) {
        stopCamera();
        // Small delay to let hardware release
        await new Promise((resolve) => setTimeout(resolve, 100));
        await startCamera();
      }
    },
    [startCamera, stopCamera]
  );

  // Synchronize stream with video element whenever stream changes or video element mounts
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Video auto-play warning:', err);
      });
    }
  }, [stream]);

  // Auto-start on mount if requested
  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount — always stop the camera to prevent resource leaks
  useEffect(() => {
    return () => {
      const currentStream = streamRef.current;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    permissionStatus,
    errorMessage,
    isStreaming,
    isMirrored,
    activeDeviceId,
    availableDevices,
    startCamera,
    stopCamera,
    toggleMirror,
    switchCamera,
  };
}
