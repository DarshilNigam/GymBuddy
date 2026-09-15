import React from 'react';
import { Calendar, Dumbbell, Award, Clock } from 'lucide-react';
import { MonthlyStats } from '../../types/analytics';
import { Badge } from '../ui/Badge';
import { StatsWidget } from '../ui/StatsWidget';
import { formatTimeWithHours } from '../../utils/formatters';

export interface MonthlyStatsOverviewProps {
  stats: MonthlyStats;
}

export function MonthlyStatsOverview({ stats }: MonthlyStatsOverviewProps) {
  const avgForm = Math.round(stats.averageFormScore || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">Monthly Performance</h3>
            <Badge variant="cyan" size="md">{stats.month}</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated workout telemetry and computer vision verification metrics.
          </p>
        </div>
      </div>

      {/* Grid of Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsWidget
          label="Total Verified Reps"
          value={stats.totalReps}
          unit="reps"
          accentColor="neon"
          icon={<Dumbbell className="w-5 h-5" />}
        />

        <StatsWidget
          label="Completed Sessions"
          value={stats.totalWorkouts}
          unit="sessions"
          accentColor="cyan"
          icon={<Calendar className="w-5 h-5" />}
        />

        <StatsWidget
          label="Active Training Time"
          value={formatTimeWithHours(stats.totalDurationMin * 60)}
          accentColor="purple"
          icon={<Clock className="w-5 h-5" />}
        />

        <StatsWidget
          label="Average Form Score"
          value={avgForm > 0 ? `${avgForm}%` : 'N/A'}
          subtext={avgForm > 0 ? 'Verified biomechanical accuracy' : 'No scored sessions yet'}
          accentColor="amber"
          icon={<Award className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}

