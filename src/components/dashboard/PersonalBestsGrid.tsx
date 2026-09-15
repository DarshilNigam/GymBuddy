import React from 'react';
import { Trophy, Award, Dumbbell } from 'lucide-react';
import { PersonalBest } from '../../types/analytics';
import { ExerciseType } from '../../types/exercise';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDuration, formatFormScoreBadge } from '../../utils/formatters';

export interface PersonalBestsGridProps {
  personalBests: Record<ExerciseType, PersonalBest>;
  onSelectExercise?: (exerciseId: string) => void;
}

export function PersonalBestsGrid({ personalBests, onSelectExercise }: PersonalBestsGridProps) {
  const exercises: { id: ExerciseType; name: string }[] = [
    { id: 'pushups', name: 'Push-ups' },
    { id: 'situps', name: 'Sit-ups' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-500 dark:text-amber-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">Personal Records</h3>
        </div>
        <Badge variant="amber" size="sm">Benchmarks</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {exercises.map(({ id, name }) => {
          const pb = personalBests?.[id];
          const hasRecord = pb && pb.maxReps > 0;
          const formBadge = hasRecord ? formatFormScoreBadge(pb.bestFormScore) : null;

          return (
            <Card
              key={id}
              variant="interactive"
              glowColor="amber"
              onClick={() => onSelectExercise && onSelectExercise(id)}
              className="p-4 relative overflow-hidden bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-white/10 shadow-light-card hover:shadow-light-hover cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 font-semibold">
                    {name}
                  </span>
                  <div className="flex items-baseline gap-2 pt-1">
                    {hasRecord ? (
                      <>
                        <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                          {pb.maxReps}
                        </span>
                        <span className="text-xs font-bold text-orange-600 dark:text-amber-400 font-display">REPS MAX</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-slate-400 dark:text-slate-500 font-display">
                          —
                        </span>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-display">No record yet</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={`p-2 rounded-xl ${
                  hasRecord
                    ? 'bg-orange-50 border border-orange-200 text-orange-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
                    : 'bg-slate-100 border border-slate-200/80 text-slate-400 dark:bg-surface-50 dark:border-white/5'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Form Quality</span>
                  {hasRecord && formBadge ? (
                    <span className={`font-semibold ${formBadge.color}`}>{pb.bestFormScore}% ({formBadge.text})</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 font-mono">--</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Session Pace</span>
                  {hasRecord ? (
                    <span className="text-slate-700 dark:text-slate-200 font-mono">{formatDuration(pb.bestSessionDuration)}</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 font-mono">--</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
