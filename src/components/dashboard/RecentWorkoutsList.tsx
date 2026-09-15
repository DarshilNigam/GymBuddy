import React from 'react';
import { Activity, Zap, ChevronRight, Clock, Dumbbell } from 'lucide-react';
import { WorkoutSession } from '../../types/workout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDuration, formatDateRelative, formatFormScoreBadge } from '../../utils/formatters';

export interface RecentWorkoutsListProps {
  sessions: WorkoutSession[];
  onSelectSession?: (session: WorkoutSession) => void;
  onViewAll?: () => void;
  onStartWorkout?: () => void;
}

export function RecentWorkoutsList({
  sessions,
  onSelectSession,
  onViewAll,
  onStartWorkout,
}: RecentWorkoutsListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">Recent Sessions</h3>
        <Card className="p-6 text-center space-y-3 bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-white/10 shadow-light-card">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-surface-50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mx-auto">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">No workouts yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete your first session to start building your verified training history.
            </p>
          </div>
          {onStartWorkout && (
            <Button variant="glow" size="sm" onClick={onStartWorkout}>
              Start First Workout
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">Recent Sessions</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-brand-primary dark:text-brand-neon hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {sessions.slice(0, 5).map((session) => {
          const isPushup = session.exerciseId === 'pushups';
          const formBadge = formatFormScoreBadge(session.averageFormScore);

          return (
            <Card
              key={session.id}
              variant="interactive"
              glowColor={isPushup ? 'neon' : 'cyan'}
              onClick={() => onSelectSession && onSelectSession(session)}
              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-white/10 shadow-light-card hover:shadow-light-hover"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                    isPushup
                      ? 'bg-blue-50 border-blue-200 text-brand-primary dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-brand-neon'
                      : 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-brand-cyan'
                  }`}
                >
                  {isPushup ? <Activity className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display">{session.exerciseName}</h4>
                    {session.personalBestBeaten && (
                      <Badge variant="amber" size="sm">PB</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{formatDateRelative(session.startTime)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {formatDuration(session.durationSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats pill */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display">
                    {session.validReps} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">reps</span>
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-semibold ${formBadge.color}`}>
                    {session.averageFormScore}% form
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
