import React from 'react';
import { Dumbbell, ArrowLeft } from 'lucide-react';
import { UserProfile, MonthlyStats } from '../types/analytics';
import { WorkoutSession } from '../types/workout';
import { MonthlyStatsOverview } from '../components/analytics/MonthlyStatsOverview';
import { AchievementsGrid } from '../components/analytics/AchievementsGrid';
import { ExerciseBreakdown } from '../components/analytics/ExerciseBreakdown';
import { PersonalBestsGrid } from '../components/dashboard/PersonalBestsGrid';
import { RecentWorkoutsList } from '../components/dashboard/RecentWorkoutsList';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export interface ProgressPageProps {
  user: UserProfile;
  monthlyStats: MonthlyStats;
  onSelectExercise: (exerciseId: string) => void;
  onSelectSession: (session: WorkoutSession) => void;
  onBack?: () => void;
}

export function ProgressPage({
  user,
  monthlyStats,
  onSelectExercise,
  onSelectSession,
  onBack,
}: ProgressPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* Top Back Navigation (if available) */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
              Analytics & Progression
            </h1>
            <Badge variant="purple" size="md">Verified Telemetry</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Lifetime repetition verification, form quality analysis, and achievements.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          onClick={() => onSelectExercise('pushups')}
          leftIcon={<Dumbbell className="w-4 h-4" />}
        >
          Start New Workout
        </Button>
      </div>

      {/* Monthly Stats Overview */}
      <MonthlyStatsOverview stats={monthlyStats} />

      {/* Breakdown & Personal Bests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExerciseBreakdown byExercise={monthlyStats.byExercise} />
        <PersonalBestsGrid
          personalBests={user.personalBests}
          onSelectExercise={onSelectExercise}
        />
      </div>

      {/* Achievements System */}
      <AchievementsGrid achievements={user.achievements} />

      {/* Full Workout History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Full Session History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">All computer vision sessions recorded on this device.</p>
          </div>
        </div>
        <RecentWorkoutsList
          sessions={user.recentWorkouts}
          onSelectSession={onSelectSession}
        />
      </div>
    </div>
  );
}
