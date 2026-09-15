import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'interactive' | 'glow';
  glowColor?: 'neon' | 'cyan' | 'purple' | 'amber' | 'blue';
}

export function Card({
  className,
  variant = 'glass',
  glowColor = 'blue',
  children,
  ...props
}: CardProps) {
  const glowBorder = {
    blue: 'hover:border-brand-primary/40 hover:shadow-light-hover dark:hover:border-brand-cyan/40 dark:hover:shadow-glow-cyan',
    neon: 'hover:border-emerald-500/40 hover:shadow-light-hover dark:hover:border-brand-neon/40 dark:hover:shadow-glow-neon',
    cyan: 'hover:border-blue-500/40 hover:shadow-light-hover dark:hover:border-brand-cyan/40 dark:hover:shadow-glow-cyan',
    purple: 'hover:border-purple-500/40 hover:shadow-light-hover dark:hover:border-purple-500/40 dark:hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.3)]',
    amber: 'hover:border-orange-500/40 hover:shadow-light-hover dark:hover:border-amber-500/40 dark:hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]',
  };

  const variants = {
    glass:
      'bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-light-card rounded-2xl dark:bg-surface-100/70 dark:border-white/8 dark:shadow-glass-edge',
    solid:
      'bg-white border border-slate-200 shadow-sm rounded-2xl dark:bg-surface-100 dark:border-white/10',
    interactive: cn(
      'bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-light-card transition-all duration-300 hover:-translate-y-1 cursor-pointer dark:bg-surface-100/70 dark:border-white/8 dark:shadow-glass-edge',
      glowBorder[glowColor]
    ),
    glow: cn(
      'bg-white backdrop-blur-2xl border border-blue-200 rounded-2xl shadow-light-card dark:bg-surface-100/80 dark:border-white/10',
      glowBorder[glowColor]
    ),
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
