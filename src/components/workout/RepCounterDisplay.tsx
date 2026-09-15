import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Target, Layers } from 'lucide-react';
import { MovementPhase } from '../../engine/exercises/baseDetector';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface RepCounterDisplayProps {
  reps: number;
  currentPhase: MovementPhase;
  progressPercent: number;
  primaryAngle?: number;
  exerciseName: string;
  className?: string;
}

export function RepCounterDisplay({
  reps,
  currentPhase,
  progressPercent,
  primaryAngle = 180,
  exerciseName,
  className,
}: RepCounterDisplayProps) {
  const isSitup = exerciseName.toLowerCase().includes('sit');

  const pushupPhaseLabels: Record<MovementPhase, { text: string; variant: 'neon' | 'cyan' | 'amber' | 'slate' | 'blue' }> = {
    idle: { text: 'Get In Position', variant: 'slate' },
    ready: { text: 'Locked Out (Ready)', variant: 'blue' },
    descending: { text: 'Lowering (Descent)', variant: 'cyan' },
    bottom: { text: 'Target Depth Reached', variant: 'neon' },
    ascending: { text: 'Driving Up (Ascent)', variant: 'amber' },
    top: { text: 'Lockout Verified', variant: 'neon' },
    rep_counted: { text: 'Rep Counted!', variant: 'neon' },
  };

  const situpPhaseLabels: Record<MovementPhase, { text: string; variant: 'neon' | 'cyan' | 'amber' | 'slate' | 'blue' }> = {
    idle: { text: 'Get In Position', variant: 'slate' },
    ready: { text: 'Lying Flat (Ready)', variant: 'blue' },
    descending: { text: 'Curling Up (Flexion)', variant: 'cyan' },
    bottom: { text: 'Ascent Peak Reached', variant: 'neon' },
    ascending: { text: 'Lowering (Reset)', variant: 'amber' },
    top: { text: 'Reset Verified', variant: 'neon' },
    rep_counted: { text: 'Rep Counted!', variant: 'neon' },
  };

  const activePhase = (isSitup ? situpPhaseLabels[currentPhase] : pushupPhaseLabels[currentPhase]) || pushupPhaseLabels.idle;

  // Format single digit with leading zero: 7 -> "07"
  const formattedReps = reps < 10 ? `0${reps}` : `${reps}`;
  const clampedDepth = Math.min(100, Math.max(0, Math.round(progressPercent)));

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-surface-100/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-4 sm:p-5 lg:p-5.5 flex flex-col justify-between shadow-light-card overflow-hidden transition-colors',
        className
      )}
    >
      {/* Background soft ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 dark:bg-brand-neon/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header info */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-mono font-bold text-slate-500 dark:text-slate-400">
            Target Movement
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">{exerciseName}</h3>
        </div>
        <Badge variant={activePhase.variant} size="sm" dot>
          {activePhase.text}
        </Badge>
      </div>

      {/* Confident Rep Counter & Circular Depth Progress */}
      <div className="my-3 sm:my-4 flex flex-col items-center justify-center relative z-10">
        <div className="relative flex items-center justify-center">
          {/* Progress Circular Arc */}
          <svg viewBox="0 0 192 192" className="w-36 h-36 sm:w-42 sm:h-42 -rotate-90 transform">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="text-slate-100 dark:text-surface-50 stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="84"
              className="text-brand-primary dark:text-brand-neon stroke-current transition-all duration-150 ease-out"
              strokeWidth="8"
              strokeDasharray={527}
              strokeDashoffset={527 - (527 * clampedDepth) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Central Counter Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={reps}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="text-5xl sm:text-6xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums leading-none"
              >
                {formattedReps}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-mono">
              REPS
            </span>
          </div>
        </div>

        {/* Live Kinematic Angle Readout */}
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-surface-50 border border-slate-200/80 dark:border-white/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm">
          <Activity className="w-3.5 h-3.5 text-brand-primary dark:text-brand-neon animate-pulse" />
          <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            {primaryAngle}° {isSitup ? 'Torso Angle' : 'Elbow Angle'}
          </span>
        </div>
      </div>

      {/* Bottom Telemetry Card: Real Depth and Kinematic Target */}
      <div className="pt-3 sm:pt-3.5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2.5 sm:gap-3 z-10">
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-surface-50 border border-slate-200/60 dark:border-white/5 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
            <Target className="w-3 h-3 text-blue-600 dark:text-brand-cyan" />
            <span>Inflection Target</span>
          </div>
          <div className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-white">
            {isSitup ? '≤ 65°' : '≤ 90°'} <span className="text-[11px] sm:text-xs font-normal text-slate-500">{isSitup ? 'Ascent' : 'Depth'}</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-surface-50 border border-slate-200/60 dark:border-white/5 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
            <Layers className="w-3 h-3 text-emerald-600 dark:text-brand-neon" />
            <span>Depth Progress</span>
          </div>
          <div className="text-sm sm:text-base font-black font-display text-emerald-600 dark:text-brand-neon">
            {clampedDepth}% <span className="text-[11px] sm:text-xs font-normal text-slate-500">ROM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
