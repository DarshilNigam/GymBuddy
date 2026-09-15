import React, { useState } from 'react';
import { Timer, Pause, Play, Square, ChevronLeft, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDuration } from '../../utils/formatters';

export interface WorkoutHeaderProps {
  exerciseName: string;
  category: string;
  elapsedSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onEndWorkout: () => void;
  onBack: () => void;
}

export function WorkoutHeader({
  exerciseName,
  category,
  elapsedSeconds,
  isPaused,
  onTogglePause,
  onEndWorkout,
  onBack,
}: WorkoutHeaderProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <>
      <header className="w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4 sticky top-0 z-40 transition-colors">
        {/* Left: Exit & Exercise Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-surface-50 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title="Exit workout"
            aria-label="Exit workout"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                {exerciseName}
              </h2>
              <Badge variant="cyan" size="sm">{category}</Badge>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Live AI Tracking
            </span>
          </div>
        </div>

        {/* Center: Stopwatch Timer */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-slate-100 dark:bg-surface-50 border border-slate-200 dark:border-white/10 shadow-sm">
          <Timer className={`w-4 h-4 ${isPaused ? 'text-amber-500' : 'text-blue-600 dark:text-brand-neon animate-pulse'}`} />
          <span className="font-mono text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-white">
            {formatDuration(elapsedSeconds)}
          </span>
          {isPaused && (
            <Badge variant="amber" size="sm">PAUSED</Badge>
          )}
        </div>

        {/* Right: Pause & End Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onTogglePause}
            leftIcon={isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-neon fill-current" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
          >
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onEndWorkout}
            leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
          >
            <span className="hidden sm:inline">End Session</span>
            <span className="sm:hidden">End</span>
          </Button>
        </div>
      </header>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-100 rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Exit workout session?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your completed repetitions will be finalized and saved to your workout history.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:flex-1 cursor-pointer"
                onClick={() => setShowExitConfirm(false)}
              >
                Keep Training
              </Button>
              <Button
                variant="danger"
                size="md"
                className="w-full sm:flex-1 cursor-pointer"
                onClick={() => {
                  setShowExitConfirm(false);
                  onBack();
                }}
              >
                Exit to Setup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
