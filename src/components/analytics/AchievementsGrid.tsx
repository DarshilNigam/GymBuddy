import React from 'react';
import { Trophy, Flame, Zap, ShieldCheck, Crown, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../../types/analytics';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDateRelative } from '../../utils/formatters';

export interface AchievementsGridProps {
  achievements: Achievement[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const iconMap: Record<string, React.ReactNode> = {
    Flame: <Flame className="w-6 h-6 text-amber-400" />,
    Zap: <Zap className="w-6 h-6 text-brand-cyan" />,
    Trophy: <Trophy className="w-6 h-6 text-yellow-400" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    Crown: <Crown className="w-6 h-6 text-purple-400" />,
    Sparkles: <Sparkles className="w-6 h-6 text-pink-400" />,
  };

  const tierColors = {
    bronze: 'border-amber-300 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20',
    silver: 'border-slate-300 dark:border-slate-400/40 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/40',
    gold: 'border-amber-300 dark:border-yellow-500/40 text-amber-600 dark:text-yellow-400 bg-amber-50 dark:bg-yellow-500/10 shadow-[0_0_20px_-5px_rgba(234,179,8,0.2)]',
    platinum: 'border-sky-300 dark:border-cyan-400/40 text-sky-600 dark:text-cyan-300 bg-sky-50 dark:bg-cyan-500/10 shadow-[0_0_20px_-5px_rgba(6,182,212,0.2)]',
    diamond: 'border-purple-300 dark:border-purple-400/40 text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">Achievements & Milestones</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Unlock sports-tech accolades as your form and rep volume evolve.</p>
        </div>
        <Badge variant="purple" size="md">
          {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((item) => {
          return (
            <Card
              key={item.id}
              className={`p-5 relative overflow-hidden transition-all duration-300 ${
                item.unlocked
                  ? 'border-slate-200 dark:border-white/15 bg-white dark:bg-surface-100/90 shadow-sm'
                  : 'border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-surface-200/50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`p-3 rounded-2xl border ${tierColors[item.tier]}`}>
                  {iconMap[item.icon] || <Trophy className="w-6 h-6 text-brand-primary dark:text-brand-neon" />}
                </div>

                <Badge variant="slate" size="sm" className="capitalize">
                  {item.tier} Tier
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">{item.title}</h4>
                  {item.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500 dark:text-slate-400">{item.requirementText}</span>
                  <span className={item.unlocked ? 'text-emerald-600 dark:text-brand-neon font-bold' : 'text-slate-400 dark:text-slate-500'}>
                    {item.unlocked ? 'COMPLETED' : `${item.progress}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-surface-50 overflow-hidden">
                  <div
                    style={{ width: `${item.progress}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.unlocked
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 dark:to-brand-neon'
                        : 'bg-brand-primary dark:bg-brand-cyan/60'
                    }`}
                  />
                </div>
                {item.unlocked && item.unlockedAt && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-1">
                    Unlocked {formatDateRelative(item.unlockedAt)}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
