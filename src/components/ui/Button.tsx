import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glow' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-2xl select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-brand-neon dark:focus-visible:ring-offset-slate-950 cursor-pointer';

    const variants = {
      primary:
        'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm hover:shadow-md font-semibold dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white',
      glow:
        'bg-brand-primary text-white font-bold hover:bg-brand-primary-hover shadow-light-blue hover:shadow-md dark:bg-brand-neon dark:text-slate-950 dark:shadow-glow-neon dark:hover:shadow-glow-pulse',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 font-semibold dark:bg-surface-50 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-white/10 dark:hover:border-white/20',
      outline:
        'bg-transparent border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-100/80 font-medium dark:border-white/15 dark:hover:border-white/40 dark:text-slate-200 dark:hover:bg-white/5',
      danger:
        'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-medium dark:bg-rose-500/15 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/25 active:bg-rose-500/30',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium dark:hover:bg-white/5 dark:text-slate-300 dark:hover:text-white',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-xl',
      md: 'text-sm px-4.5 py-2.5 gap-2 rounded-xl',
      lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl font-semibold',
      xl: 'text-lg px-8 py-4 gap-3 rounded-2xl font-bold tracking-tight',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
