import React from 'react';
import { Activity, Zap, PieChart } from 'lucide-react';
import { ExerciseType } from '../../types/exercise';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ExerciseBreakdownProps {
  byExercise: Record<ExerciseType, number>;
}

export function ExerciseBreakdown({ byExercise }: ExerciseBreakdownProps) {
  const pushups = byExercise.pushups || 0;
  const situps = byExercise.situps || 0;
  const total = pushups + situps || 1;

  const pushupPercent = Math.round((pushups / total) * 100);
  const situpPercent = 100 - pushupPercent;

  return (
    <Card className="p-5 sm:p-6 space-y-5 bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-white/10 shadow-light-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-brand-primary dark:text-brand-cyan" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Exercise Distribution</h3>
        </div>
        <Badge variant="cyan" size="sm">Volume Split</Badge>
      </div>

      {/* Progress split bar */}
      <div className="space-y-2">
        <div className="w-full h-4 rounded-xl bg-slate-100 dark:bg-surface-50 overflow-hidden flex p-0.5 border border-slate-200/80 dark:border-white/5">
          <div
            style={{ width: `${pushupPercent}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 dark:to-brand-neon rounded-l-lg transition-all duration-500"
          />
          <div
            style={{ width: `${situpPercent}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-sky-400 dark:from-cyan-500 dark:to-blue-500 rounded-r-lg transition-all duration-500"
          />
        </div>

        <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-brand-neon inline-block" />
            <span>Push-ups ({pushupPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-brand-cyan inline-block" />
            <span>Sit-ups ({situpPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-surface-50 border border-emerald-200/80 dark:border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-brand-neon">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Push-ups</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-display mt-2">{pushups}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Verified reps this month</span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-surface-50 border border-sky-200/80 dark:border-cyan-500/20">
          <div className="flex items-center gap-2 text-sky-600 dark:text-brand-cyan">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Sit-ups</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-display mt-2">{situps}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Verified reps this month</span>
        </div>
      </div>
    </Card>
  );
}
