import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export interface StatsWidgetProps {
  title?: string;
  label?: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  } | string;
  trendPositive?: boolean;
  accentColor?: 'neon' | 'cyan' | 'purple' | 'amber' | 'blue';
  className?: string;
}

export function StatsWidget({
  title,
  label,
  value,
  unit,
  subtitle,
  subtext,
  icon,
  trend,
  trendPositive = true,
  accentColor = 'blue',
  className,
}: StatsWidgetProps) {
  const displayLabel = title || label || '';
  const displaySubtext = subtitle || subtext || '';

  const iconAccents = {
    neon: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-brand-neon/10 dark:text-brand-neon dark:border-brand-neon/20',
    cyan: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-brand-cyan/10 dark:text-brand-cyan dark:border-brand-cyan/20',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    amber: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    blue: 'bg-blue-50 text-brand-primary border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  };

  return (
    <Card className={cn('p-5 relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{displayLabel}</p>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl lg:text-3xl font-black tracking-tight font-display text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
          </div>
          {displaySubtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{displaySubtext}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-1 text-xs font-medium">
              {typeof trend === 'string' ? (
                <span className={trendPositive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400'}>
                  {trend}
                </span>
              ) : (
                <>
                  <span className={trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {trend.isPositive ? '↑' : '↓'} {trend.value}
                  </span>
                  <span className="text-slate-400">vs last week</span>
                </>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-2xl border flex items-center justify-center', iconAccents[accentColor])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
