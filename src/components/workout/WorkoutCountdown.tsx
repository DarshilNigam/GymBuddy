import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, FastForward } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface WorkoutCountdownProps {
  exerciseName: string;
  onComplete: () => void;
  onSkip?: () => void;
  className?: string;
}

export function WorkoutCountdown({
  exerciseName,
  onComplete,
  onSkip,
  className,
}: WorkoutCountdownProps) {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(finishTimer);
    }
  }, [count, onComplete]);

  return (
    <div
      className={cn(
        'absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white p-6 select-none',
        className
      )}
      role="region"
      aria-label="Workout starting countdown"
    >
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/30 text-brand-neon text-xs font-mono font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Starting {exerciseName}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Get into your starting position. AI tracking begins now!
        </p>
      </div>

      {/* Main Animated Countdown Number */}
      <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 my-2">
        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-600/30 to-brand-neon/20 border-2 border-brand-neon flex items-center justify-center shadow-[0_0_40px_rgba(0,245,160,0.35)]">
                <span className="text-6xl sm:text-7xl font-black font-display text-white tabular-nums drop-shadow-md">
                  {count}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="go"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="px-8 py-4 rounded-3xl bg-emerald-500 text-slate-950 border-2 border-brand-neon flex items-center justify-center shadow-[0_0_50px_rgba(0,245,160,0.6)]">
                <span className="text-4xl sm:text-5xl font-black font-display tracking-wider">
                  GO!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Button */}
      {onSkip && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip Countdown</span>
          </button>
        </div>
      )}
    </div>
  );
}
