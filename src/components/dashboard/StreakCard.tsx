import React from 'react';
import { Flame, Calendar, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  activeDays?: boolean[];
  onViewDetails?: () => void;
  className?: string;
}

export function StreakCard({ currentStreak, longestStreak, activeDays, onViewDetails, className = '' }: StreakCardProps) {
  // Days of the week indicator (Monday to Sunday)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDayIdx = new Date().getDay(); // 0 is Sunday
  const normalizedTodayIdx = todayDayIdx === 0 ? 6 : todayDayIdx - 1; // 0 is Monday

  const hasStreak = currentStreak > 0;

  return (
    <Card className={`p-4 sm:p-5 relative overflow-hidden bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-amber-500/20 shadow-light-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Badge variant={hasStreak ? 'amber' : 'slate'} size="sm" dot={hasStreak}>
              {hasStreak ? 'Active Training Streak' : 'Start a Streak'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2 pt-1.5">
            <span className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              {currentStreak}
            </span>
            <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-amber-400 font-display">
              {currentStreak === 1 ? 'DAY' : 'DAYS IN A ROW'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {longestStreak > 0 ? (
              <>
                Longest benchmark: <strong className="text-slate-700 dark:text-slate-200">{longestStreak} consecutive days</strong>
              </>
            ) : (
              'Complete a workout today to initiate your daily streak.'
            )}
          </p>
        </div>

        <div className={`p-2.5 rounded-xl border ${
          hasStreak
            ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
            : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-surface-50 dark:border-white/5'
        }`}>
          <Flame className={`w-6 h-6 ${hasStreak ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      {/* Week Day Bubbles */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between gap-1 sm:gap-1.5">
          {days.map((day, idx) => {
            const isCompleted = activeDays ? Boolean(activeDays[idx]) : (hasStreak && idx <= normalizedTodayIdx);
            const isToday = idx === normalizedTodayIdx;

            return (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-orange-50 border border-orange-200 text-orange-600 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300 shadow-sm'
                      : 'bg-slate-100 border border-slate-200/60 text-slate-400 dark:bg-surface-50 dark:border-white/5 dark:text-slate-500'
                  } ${isToday ? 'ring-2 ring-brand-primary dark:ring-brand-neon ring-offset-1 sm:ring-offset-2 ring-offset-background' : ''}`}
                >
                  {isCompleted ? <Flame className="w-3.5 h-3.5 text-orange-500 dark:text-amber-400" /> : day}
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
