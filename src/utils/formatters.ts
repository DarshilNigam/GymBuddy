export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDateRelative(dateStr: string | number): string {
  const date = typeof dateStr === 'number' ? new Date(dateStr) : new Date(dateStr);
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSec < 60) return 'Just now';
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  if (diffInSec < 172800) return 'Yesterday';
  if (diffInSec < 604800) return `${Math.floor(diffInSec / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFormScoreBadge(score: number): { text: string; color: string; bg: string } {
  if (score >= 90) return { text: 'Elite Form', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' };
  if (score >= 80) return { text: 'Great Form', color: 'text-sky-700 dark:text-cyan-400', bg: 'bg-sky-50 border-sky-200 dark:bg-cyan-500/10 dark:border-cyan-500/30' };
  if (score >= 70) return { text: 'Good Form', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30' };
  if (score >= 60) return { text: 'Needs Work', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30' };
  return { text: 'Check Posture', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' };
}
