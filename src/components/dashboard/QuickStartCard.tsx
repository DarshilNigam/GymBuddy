import React from 'react';
import { Activity, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import { ExerciseConfig } from '../../types/exercise';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface QuickStartCardProps {
  exercise: ExerciseConfig;
  personalBest?: number;
  onSelect: (exerciseId: string) => void;
}

export function QuickStartCard({ exercise, personalBest = 0, onSelect }: QuickStartCardProps) {
  const isPushup = exercise.id === 'pushups';

  return (
    <Card
      variant="interactive"
      glowColor={isPushup ? 'neon' : 'cyan'}
      onClick={() => onSelect(exercise.id)}
      className="p-4 sm:p-5 relative group overflow-hidden bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-white/10 shadow-light-card hover:shadow-light-hover"
    >
      <div className="flex flex-col h-full justify-between gap-4 relative z-10">
        <div>
          {/* Category & Difficulty Tag */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Badge variant={isPushup ? 'blue' : 'cyan'} size="sm">
                {isPushup ? 'Upper Body' : 'Core'}
              </Badge>
              <Badge variant="slate" size="sm">
                {exercise.difficulty}
              </Badge>
            </div>
            {personalBest > 0 && (
              <span className="text-xs font-mono font-bold text-orange-600 dark:text-amber-400">
                PB: {personalBest} REPS
              </span>
            )}
          </div>

          {/* Title & Icon */}
          <div className="flex items-center gap-3 mt-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shrink-0 ${
                isPushup
                  ? 'bg-blue-50 border-blue-200 text-brand-primary dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-brand-neon'
                  : 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-brand-cyan'
              }`}
            >
              {isPushup ? <Activity className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display group-hover:text-brand-primary dark:group-hover:text-brand-neon transition-colors">
                {exercise.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {exercise.description}
              </p>
            </div>
          </div>

          {/* Muscle Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {exercise.targetMuscles.map((muscle) => (
              <span
                key={muscle}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 font-medium dark:bg-surface-50 dark:border-white/5 dark:text-slate-300"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button Area */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-neon" />
            <span>AI Kinematic Validation</span>
          </div>

          <Button
            variant={isPushup ? 'glow' : 'secondary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(exercise.id);
            }}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Train Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
