import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neon' | 'cyan' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'blue',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neon: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-brand-neon/10 dark:text-brand-neon dark:border-brand-neon/30',
    cyan: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-brand-cyan/10 dark:text-brand-cyan dark:border-brand-cyan/30',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
    amber: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10',
  };

  const dotColors = {
    neon: 'bg-emerald-500 dark:bg-brand-neon dark:shadow-glow-neon',
    cyan: 'bg-blue-500 dark:bg-brand-cyan dark:shadow-glow-cyan',
    blue: 'bg-blue-600 dark:bg-blue-400',
    purple: 'bg-purple-600 dark:bg-purple-400',
    amber: 'bg-orange-500 dark:bg-amber-400',
    rose: 'bg-rose-500 dark:bg-rose-400',
    slate: 'bg-slate-500 dark:bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
}
