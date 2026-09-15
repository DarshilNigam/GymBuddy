import React from 'react';
import { Camera, Check, Lightbulb, Play, AlertCircle, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { ExerciseConfig } from '../../types/exercise';
import { DetectionState, Landmark } from '../../types/pose';
import { validateSideAdaptiveLandmarks, PUSHUP_KEY_JOINTS, SITUP_KEY_JOINTS } from '../../engine/geometry/landmarkValidation';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface CalibrationGuideProps {
  exercise: ExerciseConfig;
  detectionState?: DetectionState;
  landmarks?: Landmark[];
  onReady: () => void;
  onOpenHowTo?: () => void;
}

export function CalibrationGuide({
  exercise,
  detectionState,
  landmarks = [],
  onReady,
  onOpenHowTo,
}: CalibrationGuideProps) {
  const isModelLoaded = detectionState?.isModelLoaded ?? false;
  const isPersonInFrame = detectionState?.isPersonInFrame ?? false;
  const isModelLoading = detectionState?.isModelLoading ?? false;

  const jointGroups = exercise.id === 'pushups' ? PUSHUP_KEY_JOINTS : SITUP_KEY_JOINTS;
  const validation = validateSideAdaptiveLandmarks(landmarks, jointGroups, 0.4);

  const isPositionReady = isPersonInFrame && validation.isValid;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="cyan" size="md">Real-Time Calibration</Badge>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
          Calibrate for {exercise.name}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Position your camera for a clear side view of your body. The AI will verify joint tracking in real time.
        </p>
      </div>

      {/* Live AI Detection Status Card */}
      <Card className="p-6 border-slate-200/90 dark:border-white/10 bg-white dark:bg-surface-100/90 shadow-light-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary dark:text-brand-neon" />
            <span className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
              Live Pose Diagnostics
            </span>
          </div>

          <Badge
            variant={isPositionReady ? 'neon' : isPersonInFrame ? 'cyan' : 'slate'}
            size="sm"
            dot
          >
            {isPositionReady
              ? 'Ready to Begin'
              : isPersonInFrame
              ? 'Adjusting Alignment'
              : isModelLoading
              ? 'Loading Model...'
              : 'Searching for Body'}
          </Badge>
        </div>

        {/* Dynamic Checklist based on real MediaPipe detection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all',
              isModelLoaded
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                : 'bg-slate-50 border-slate-200/80 text-slate-500 dark:bg-surface-50 dark:border-white/5 dark:text-slate-400'
            )}
          >
            {isModelLoaded ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-brand-neon shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
            )}
            <span className="font-medium">Computer Vision Model Ready</span>
          </div>

          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all',
              isPersonInFrame
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                : 'bg-slate-50 border-slate-200/80 text-slate-500 dark:bg-surface-50 dark:border-white/5 dark:text-slate-400'
            )}
          >
            {isPersonInFrame ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-brand-neon shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-600 shrink-0" />
            )}
            <span className="font-medium">Body Detected in Frame</span>
          </div>

          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all',
              validation.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                : 'bg-slate-50 border-slate-200/80 text-slate-500 dark:bg-surface-50 dark:border-white/5 dark:text-slate-400'
            )}
          >
            {validation.isValid ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-brand-neon shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-600 shrink-0" />
            )}
            <span className="font-medium">Key Joints Visible ({validation.activeSide} profile)</span>
          </div>

          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all',
              (detectionState?.calibrationScore ?? 0) >= 50
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                : 'bg-slate-50 border-slate-200/80 text-slate-500 dark:bg-surface-50 dark:border-white/5 dark:text-slate-400'
            )}
          >
            {(detectionState?.calibrationScore ?? 0) >= 50 ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-brand-neon shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-600 shrink-0" />
            )}
            <span className="font-medium">Tracking Confidence ({detectionState?.calibrationScore ?? 0}%)</span>
          </div>
        </div>

        {/* Guidance tip if missing landmarks */}
        {!isPositionReady && (
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-300 text-xs flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Positioning Tip</span>
              <p className="text-[11px] leading-relaxed">
                Step back so your head, shoulders, hips, and feet are fully within view of the camera.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {onOpenHowTo && (
            <button
              type="button"
              onClick={onOpenHowTo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 hover:text-brand-primary dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-brand-cyan" />
              <span>Show Me How Guide</span>
            </button>
          )}

          <Button
            variant="glow"
            size="lg"
            className="w-full flex-1 shadow-light-blue"
            onClick={onReady}
            leftIcon={<Play className="w-4 h-4 fill-current" />}
          >
            Start Workout Session
          </Button>
        </div>
      </Card>
    </div>
  );
}
