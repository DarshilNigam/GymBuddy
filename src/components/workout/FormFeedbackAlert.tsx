import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { FormFeedback } from '../../types/workout';
import { cn } from '../../utils/cn';

export interface FormFeedbackAlertProps {
  feedback: FormFeedback | null;
  className?: string;
}

export function FormFeedbackAlert({ feedback, className }: FormFeedbackAlertProps) {
  if (!feedback) {
    return (
      <div className={cn('p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-surface-100/70 border border-slate-200/80 dark:border-white/5 flex items-center gap-2.5 sm:gap-3 text-slate-500 dark:text-slate-400 shadow-sm transition-colors', className)}>
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-brand-cyan shrink-0" />
        <span className="text-xs sm:text-[13px] font-medium leading-normal">
          Vision engine tracking posture. Perform continuous reps with full range of motion.
        </span>
      </div>
    );
  }

  const icons = {
    good: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-brand-neon shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-brand-cyan shrink-0" />,
  };

  const styles = {
    good: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 shadow-sm dark:shadow-glow-neon',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-200',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={feedback.id}
        initial={{ opacity: 0, y: 6, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'p-2.5 sm:p-3 rounded-2xl border backdrop-blur-xl flex items-center gap-2.5 sm:gap-3 transition-all',
          styles[feedback.type] || styles.info,
          className
        )}
      >
        {icons[feedback.type]}
        <div className="flex-1">
          <span className="text-xs sm:text-[13px] font-semibold tracking-wide block leading-snug">
            {feedback.message}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
