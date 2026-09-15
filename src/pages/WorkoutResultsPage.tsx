import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  Activity,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Zap,
} from 'lucide-react';
import { WorkoutSession } from '../types/workout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatsWidget } from '../components/ui/StatsWidget';
import { formatDuration, formatFormScoreBadge } from '../utils/formatters';
import { fireWorkoutCelebration } from '../utils/confetti';

export interface WorkoutResultsPageProps {
  session: WorkoutSession;
  onGoHome: () => void;
  onRestart: (exerciseId: string) => void;
  onChooseAnother?: () => void;
  onBack?: () => void;
}

export function WorkoutResultsPage({
  session,
  onGoHome,
  onRestart,
  onChooseAnother,
  onBack,
}: WorkoutResultsPageProps) {
  useEffect(() => {
    fireWorkoutCelebration();
  }, []);

  const formBadge = formatFormScoreBadge(session.averageFormScore);
  const isPushup = session.exerciseId === 'pushups';
  const hasRealReps = session.validReps > 0 || (session.repsHistory && session.repsHistory.length > 0);

  // Derived real rep cadence
  const avgPaceSec = session.validReps > 0
    ? (session.durationSeconds / session.validReps).toFixed(1)
    : '--';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-4 sm:pb-5 space-y-3 sm:space-y-4">
      {/* Top Back Navigation (if available) */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Top Banner / Completion Header */}
      <div className="text-center space-y-1 sm:space-y-1.5">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="inline-flex items-center gap-2"
        >
          <Badge variant="neon" size="sm" dot>
            WORKOUT COMPLETE
          </Badge>
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
          {hasRealReps ? 'Nice work.' : 'Session Complete.'}
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-normal">
          {hasRealReps
            ? 'Your movement was verified in real time via computer vision kinematics.'
            : 'Session completed. No valid repetitions were logged during this interval.'}
        </p>
      </div>

      {/* Personal Best Alert Banner if Beaten */}
      {session.personalBestBeaten && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400">
                <Trophy className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider">
                  New Personal Record
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-display">
                  All-Time Highest {session.exerciseName} Session
                </h3>
              </div>
            </div>
            <Badge variant="amber" size="sm">RECORD LOGGED</Badge>
          </Card>
        </motion.div>
      )}

      {/* Main Stats Showcase Card */}
      <Card className="p-4 sm:p-5 lg:p-6 border-slate-200/90 dark:border-white/10 bg-white dark:bg-surface-100/90 space-y-3.5 sm:space-y-4 shadow-light-card">
        {/* Exercise Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border ${
                isPushup
                  ? 'bg-blue-50 border-blue-200 text-brand-primary dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-brand-neon'
                  : 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-brand-cyan'
              }`}
            >
              {isPushup ? <Activity className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">
                {session.exerciseName}
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Verified Telemetry Summary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${formBadge.bg} ${formBadge.color}`}>
              {formBadge.text} Form ({session.averageFormScore}%)
            </span>
          </div>
        </div>

        {/* 4 Real Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <StatsWidget
            label="Verified Reps"
            value={session.validReps}
            unit="reps"
            accentColor="blue"
            icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="p-3 sm:p-3.5"
          />

          <StatsWidget
            label="Active Duration"
            value={formatDuration(session.durationSeconds)}
            accentColor="cyan"
            icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="p-3 sm:p-3.5"
          />

          <StatsWidget
            label="Form Accuracy"
            value={`${session.averageFormScore}%`}
            accentColor="purple"
            icon={<Award className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="p-3 sm:p-3.5"
          />

          <StatsWidget
            label="Average Pace"
            value={avgPaceSec !== '--' ? `${avgPaceSec}s` : '--'}
            unit={avgPaceSec !== '--' ? '/ rep' : ''}
            accentColor="amber"
            icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="p-3 sm:p-3.5"
          />
        </div>

        {/* Biomechanical Breakdown */}
        <div className="space-y-2.5 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-white/8">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            Form Consistency & Completion Ratio
          </h4>

          {hasRealReps ? (() => {
            const total = Math.max(1, session.totalReps);
            const validRatio = Math.round((session.validReps / total) * 100);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Average Joint Form Score</span>
                    <span className="text-brand-primary dark:text-brand-neon font-mono">{session.averageFormScore}%</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-brand-primary dark:bg-brand-neon rounded-full transition-all duration-500"
                      style={{ width: `${session.averageFormScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    Calculated from geometric depth & lockout accuracy across {session.totalReps} rep attempts.
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Verified Quality Ratio</span>
                    <span className="text-sky-600 dark:text-brand-cyan font-mono">{validRatio}%</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 dark:bg-brand-cyan rounded-full transition-all duration-500"
                      style={{ width: `${validRatio}%` }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    {session.validReps} of {session.totalReps} attempts satisfied full range-of-motion criteria.
                  </p>
                </div>
              </div>
            );
          })() : (
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                No reps met the minimum range of motion threshold in this session.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3.5 sm:pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => onRestart(session.exerciseId)}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Train {session.exerciseName} Again
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="glow"
              size="md"
              className="w-full sm:w-auto min-w-[180px] shadow-light-blue cursor-pointer"
              onClick={onGoHome}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
