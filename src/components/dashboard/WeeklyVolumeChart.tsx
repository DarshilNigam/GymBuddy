import React from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DailyActivity } from '../../types/analytics';

export interface WeeklyVolumeChartProps {
  dailyBreakdown: DailyActivity[];
  className?: string;
}

export function WeeklyVolumeChart({ dailyBreakdown = [], className = '' }: WeeklyVolumeChartProps) {
  // Ensure we display exactly 7 days
  const last7Days = dailyBreakdown && dailyBreakdown.length > 0 ? dailyBreakdown.slice(-7) : [];
  
  // Calculate total verified reps from the 7-day window
  const totalVolume = last7Days.reduce((acc, d) => acc + (d.count || 0), 0);
  const maxCount = Math.max(...last7Days.map((d) => d.count || 0), 10);

  return (
    <Card className={`p-4 sm:p-5 space-y-3 bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-white/10 shadow-light-card ${className}`}>
      {/* Header with real 7-day summary */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-primary dark:text-brand-neon" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              Weekly Rep Volume
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
            7-Day Total: <strong className="text-slate-900 dark:text-white font-mono">{totalVolume} reps</strong>
          </p>
        </div>

        <Badge variant={totalVolume > 0 ? 'cyan' : 'slate'} size="sm">
          {totalVolume > 0 ? `${totalVolume} Reps (7D)` : '7-Day Trajectory'}
        </Badge>
      </div>

      {/* 7-Day Bar Chart Viewport */}
      <div className="h-[155px] sm:h-[170px] flex items-end justify-between gap-1.5 sm:gap-2.5 pt-2 pb-1">
        {last7Days.map((item, idx) => {
          const count = item.count || 0;
          const heightPercent = count > 0 ? Math.max(14, Math.round((count / maxCount) * 100)) : 0;
          
          const dateObj = new Date(item.date);
          const isValidDate = !isNaN(dateObj.getTime());
          const dayName = isValidDate
            ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
            : `D${idx + 1}`;
          const formattedDate = isValidDate
            ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : item.date;

          const isToday = idx === last7Days.length - 1;

          return (
            <div
              key={item.date || idx}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
            >
              {/* Floating Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-150 absolute -top-8 z-30 pointer-events-none bg-slate-900 text-white dark:bg-surface-50 dark:text-slate-100 border border-slate-700 dark:border-white/10 px-2 py-1 rounded-md text-[10px] font-mono shadow-xl whitespace-nowrap">
                <span className="font-bold text-sky-400 dark:text-brand-neon">{count} reps</span> • {formattedDate}
              </div>

              {/* Rep Number above bar */}
              <span className={`text-[10px] sm:text-[11px] font-mono h-4 flex items-center justify-center font-bold ${
                count > 0
                  ? isToday
                    ? 'text-brand-primary dark:text-brand-neon'
                    : 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-300 dark:text-slate-600'
              }`}>
                {count > 0 ? count : '0'}
              </span>

              {/* Bar Track & Fill */}
              <div className="w-full max-w-[32px] sm:max-w-[40px] bg-slate-100/90 dark:bg-surface-50 rounded-xl overflow-hidden h-full flex items-end p-1 border border-slate-200/80 dark:border-white/5 transition-colors group-hover:border-blue-300 dark:group-hover:border-brand-cyan/40">
                <div
                  style={{ height: count > 0 ? `${heightPercent}%` : '5px' }}
                  className={`w-full rounded-lg transition-all duration-500 ${
                    count > 0
                      ? isToday
                        ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-sky-400 dark:from-emerald-500 dark:to-brand-neon shadow-sm dark:shadow-glow-neon'
                        : 'bg-gradient-to-t from-blue-500 to-sky-400 group-hover:from-blue-600 group-hover:to-sky-300 dark:from-cyan-600 dark:to-brand-cyan'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              </div>

              {/* Day Label */}
              <div className="flex flex-col items-center">
                <span className={`text-[10px] sm:text-[11px] font-mono ${
                  isToday
                    ? 'font-bold text-brand-primary dark:text-brand-neon'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {dayName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
