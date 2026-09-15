import React from 'react';
import { Camera, FlipHorizontal, Eye, Loader2, AlertCircle } from 'lucide-react';
import { DetectionState, Landmark } from '../../types/pose';
import { Badge } from '../ui/Badge';
import { SkeletonOverlay } from './SkeletonOverlay';
import { cn } from '../../utils/cn';

export interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  isMirrored: boolean;
  onToggleMirror: () => void;
  detectionState: DetectionState;
  landmarks?: Landmark[];
  exerciseId?: string;
  isModelLoading?: boolean;
  modelError?: string | null;
  showCalibrationGrid?: boolean;
  className?: string;
}

export function CameraFeed({
  videoRef,
  isStreaming,
  isMirrored,
  onToggleMirror,
  detectionState,
  landmarks = [],
  exerciseId = 'pushups',
  isModelLoading = false,
  modelError = null,
  showCalibrationGrid = true,
  className,
}: CameraFeedProps) {
  const isPersonInFrame = detectionState.isPersonInFrame;
  const isModelReady = detectionState.isModelLoaded;

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[320px] sm:min-h-[360px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-2xl flex items-center justify-center transition-colors',
        className
      )}
    >
      {/* HTML Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={cn(
          'w-full h-full object-cover transition-transform duration-200',
          isMirrored && 'scale-x-[-1]',
          !isStreaming && 'hidden'
        )}
      />

      {/* Real Computer Vision Skeleton Overlay */}
      {isStreaming && isModelReady && (
        <SkeletonOverlay
          landmarks={landmarks}
          isMirrored={isMirrored}
          exerciseId={exerciseId}
          isPersonInFrame={isPersonInFrame}
        />
      )}

      {/* When camera is idle or not yet streaming */}
      {!isStreaming && (
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-50 border border-white/10 flex items-center justify-center text-slate-400">
            <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white font-display">Camera Offline</h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
              Initialize camera permissions to enable real-time computer vision tracking.
            </p>
          </div>
        </div>
      )}

      {/* Model Loading State Overlay */}
      {isStreaming && (isModelLoading || !isModelReady) && !modelError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md text-xs font-mono text-cyan-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>Initializing MediaPipe Pose Engine...</span>
        </div>
      )}

      {/* Model Error Warning */}
      {modelError && (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl bg-rose-950/80 border border-rose-500/30 backdrop-blur-md text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Pose model warning: {modelError}</span>
        </div>
      )}

      {/* Visual Alignment Guides / Grid Overlay */}
      {isStreaming && showCalibrationGrid && (
        <div className="absolute inset-0 pointer-events-none border-[1.5px] border-brand-neon/20 rounded-3xl m-3 sm:m-4 flex flex-col justify-between p-3 sm:p-4 z-[6]">
          <div className="flex justify-between items-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 border-t-2 border-l-2 border-brand-neon rounded-tl-lg" />
            <div className="w-7 h-7 sm:w-8 sm:h-8 border-t-2 border-r-2 border-brand-neon rounded-tr-lg" />
          </div>

          {/* Center Target Box */}
          <div className="self-center w-3/4 max-w-md h-3/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400 bg-background/80 px-3 py-1 rounded-full backdrop-blur-md">
              Side Profile Alignment Zone
            </span>
          </div>

          <div className="flex justify-between items-end">
            <div className="w-7 h-7 sm:w-8 sm:h-8 border-b-2 border-l-2 border-brand-neon rounded-bl-lg" />
            <div className="w-7 h-7 sm:w-8 sm:h-8 border-b-2 border-r-2 border-brand-neon rounded-br-lg" />
          </div>
        </div>
      )}

      {/* Floating HUD Badges on Top */}
      {isStreaming && (
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Badge variant={isPersonInFrame ? 'neon' : 'slate'} size="sm" dot>
              {isPersonInFrame ? 'Subject Locked' : 'Searching Subject'}
            </Badge>
            <Badge variant="slate" size="sm">
              {detectionState.fps > 0 ? `${detectionState.fps} FPS` : 'Tracking'}
            </Badge>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleMirror}
              className="p-1.5 sm:p-2 rounded-xl bg-background/70 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Flip camera horizontally"
            >
              <FlipHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detection Quality Indicator at Bottom Bar */}
      {isStreaming && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between bg-surface-300/85 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-surface-100 border border-white/10 text-brand-cyan">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  {isPersonInFrame ? 'Pose Tracking Active' : 'Waiting for Subject'}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded',
                    detectionState.calibrationScore >= 50
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-amber-400 bg-amber-500/10'
                  )}
                >
                  {detectionState.calibrationScore > 0 ? `${detectionState.calibrationScore}% Confidence` : 'Searching'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {exerciseId === 'pushups'
                  ? 'Analyzing shoulder, elbow, wrist, and spine alignment'
                  : 'Analyzing shoulder, hip, knee, and ankle kinematics'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500">Latency: </span>
              <span className="text-slate-200">{detectionState.latencyMs > 0 ? `${detectionState.latencyMs}ms` : '--'}</span>
            </div>
            <div>
              <span className="text-slate-500">View: </span>
              <span className="text-slate-200 capitalize">{detectionState.activeSide} Side</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
