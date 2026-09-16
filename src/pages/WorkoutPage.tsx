import React, { useState, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useWorkout } from '../hooks/useWorkout';
import { ExerciseConfig } from '../types/exercise';
import { WorkoutSession } from '../types/workout';
import { Landmark, DetectionState, PoseFrameData } from '../types/pose';
import { CameraFeed } from '../components/workout/CameraFeed';
import { RepCounterDisplay } from '../components/workout/RepCounterDisplay';
import { WorkoutHeader } from '../components/workout/WorkoutHeader';
import { FormFeedbackAlert } from '../components/workout/FormFeedbackAlert';
import { CalibrationGuide } from '../components/workout/CalibrationGuide';
import { ShowMeHowModal } from '../components/workout/ShowMeHowModal';
import { WorkoutCountdown } from '../components/workout/WorkoutCountdown';
import { Button } from '../components/ui/Button';
import { Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export interface WorkoutPageProps {
  exercise: ExerciseConfig;
  onFinishWorkout: (session: WorkoutSession) => void;
  onExit: () => void;
}

export function WorkoutPage({ exercise, onFinishWorkout, onExit }: WorkoutPageProps) {
  const [showCalibration, setShowCalibration] = useState(true);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<Landmark[]>([]);

  // 1. Initialize camera
  const {
    videoRef,
    stream,
    isStreaming,
    isMirrored,
    toggleMirror,
    stopCamera,
  } = useCamera({ autoStart: true });

  // 2. Initialize workout engine
  const {
    status,
    elapsedSeconds,
    validReps,
    currentPhase,
    progressPercent,
    primaryAngle,
    latestFeedback,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    processPoseFrame,
  } = useWorkout({
    exerciseId: exercise.id,
    onFinish: (finalSession) => {
      setCurrentLandmarks([]);
      stopCamera();
      onFinishWorkout(finalSession);
    },
  });

  // 3. Connect real-time pose detection stream to workout engine
  const handlePoseFrame = useCallback(
    (frame: PoseFrameData, _state: DetectionState) => {
      if (!isStreaming) {
        setCurrentLandmarks([]);
        return;
      }
      setCurrentLandmarks(frame.detected ? frame.landmarks : []);
      // Only process reps and angle updates when active (not during countdown or when paused)
      processPoseFrame(frame.landmarks, frame.timestamp);
    },
    [isStreaming, processPoseFrame]
  );

  const { detectionState, isModelLoading, error: modelError } = usePoseDetection({
    videoRef,
    isStreaming,
    stream,
    onFrame: handlePoseFrame,
  });

  const isPaused = status === 'paused';

  // Handle starting workout from calibration
  const handleCalibrationReady = () => {
    setShowCalibration(false);
    setIsCountingDown(true);
  };

  const handleCountdownComplete = () => {
    setIsCountingDown(false);
    startWorkout();
  };

  const handleExit = () => {
    setCurrentLandmarks([]);
    stopCamera();
    onExit();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-background-dark dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Workout Header Bar */}
      <WorkoutHeader
        exerciseName={exercise.name}
        category={exercise.category}
        elapsedSeconds={elapsedSeconds}
        isPaused={isPaused}
        onTogglePause={() => (isPaused ? resumeWorkout() : pauseWorkout())}
        onEndWorkout={finishWorkout}
        onBack={handleExit}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-stretch">
          {/* Persistent Camera Feed Column (Single Stable Mount) */}
          <div
            className={cn(
              'flex flex-col gap-2 sm:gap-2.5 relative transition-all duration-300',
              showCalibration
                ? 'lg:col-span-5 hidden lg:flex'
                : 'lg:col-span-7 xl:col-span-8'
            )}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl flex-1 flex flex-col">
              <CameraFeed
                videoRef={videoRef}
                isStreaming={isStreaming}
                stream={stream}
                isMirrored={isMirrored}
                onToggleMirror={toggleMirror}
                detectionState={detectionState}
                landmarks={currentLandmarks}
                exerciseId={exercise.id}
                isModelLoading={isModelLoading}
                modelError={modelError}
                showCalibrationGrid={showCalibration}
                className={cn(
                  'w-full flex-1',
                  showCalibration
                    ? 'h-[360px] sm:h-[400px] lg:h-[440px]'
                    : 'h-[370px] sm:h-[420px] lg:h-[450px] xl:h-[490px]'
                )}
              />

              {/* 3-2-1 Countdown Overlay */}
              {isCountingDown && (
                <WorkoutCountdown
                  exerciseName={exercise.name}
                  onComplete={handleCountdownComplete}
                  onSkip={handleCountdownComplete}
                />
              )}
            </div>

            {/* Form Feedback Alert Bar (active workout only) */}
            {!showCalibration && <FormFeedbackAlert feedback={latestFeedback} />}
          </div>

          {/* Right Column: Calibration Guide OR Repetition Counter Console */}
          <div
            className={cn(
              showCalibration
                ? 'lg:col-span-7 w-full'
                : 'lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-2 sm:gap-2.5'
            )}
          >
            {showCalibration ? (
              <CalibrationGuide
                exercise={exercise}
                detectionState={detectionState}
                landmarks={currentLandmarks}
                onReady={handleCalibrationReady}
                onOpenHowTo={() => setShowHowToModal(true)}
              />
            ) : (
              <>
                <RepCounterDisplay
                  reps={validReps}
                  currentPhase={currentPhase}
                  progressPercent={progressPercent}
                  primaryAngle={primaryAngle}
                  exerciseName={exercise.name}
                  className="flex-1"
                />

                {/* Real-time Status Card & Quick Tools */}
                <div className="p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-surface-100/90 border border-slate-200/90 dark:border-white/10 shadow-light-card space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary dark:text-brand-neon" />
                      AI Vision Console
                    </span>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <button
                        onClick={() => setShowHowToModal(true)}
                        className="text-xs font-semibold text-brand-primary dark:text-brand-neon hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Show Me How
                      </button>
                      <button
                        onClick={() => setShowCalibration(true)}
                        className="text-xs font-semibold text-sky-600 dark:text-brand-cyan hover:underline cursor-pointer"
                      >
                        Recalibrate
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-brand-neon shrink-0" />
                    <span className="font-bold">Real-time Kinematic Repetition Counting Active</span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Perform full range of motion. Repetitions are verified and counted upon complete lockout or reset.
                  </p>

                  <div className="pt-0.5 sm:pt-1">
                    <Button
                      variant="glow"
                      size="md"
                      className="w-full text-xs sm:text-sm font-bold shadow-light-blue cursor-pointer"
                      onClick={() => setShowHowToModal(true)}
                      leftIcon={<HelpCircle className="w-4 h-4" />}
                    >
                      Tell Me How To Do It
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Visual Show Me How Modal */}
      <ShowMeHowModal
        isOpen={showHowToModal}
        onClose={() => setShowHowToModal(false)}
        initialExercise={exercise.id === 'situps' ? 'situps' : 'pushups'}
      />
    </div>
  );
}

