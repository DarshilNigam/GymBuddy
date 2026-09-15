import React from 'react';
import { Flame, Trophy, Play, ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatsWidget } from '../components/ui/StatsWidget';
import { StreakCard } from '../components/dashboard/StreakCard';
import { QuickStartCard } from '../components/dashboard/QuickStartCard';
import { RecentWorkoutsList } from '../components/dashboard/RecentWorkoutsList';
import { PersonalBestsGrid } from '../components/dashboard/PersonalBestsGrid';
import { WeeklyVolumeChart } from '../components/dashboard/WeeklyVolumeChart';
import { UserProfile, MonthlyStats } from '../types/analytics';
import { WorkoutSession } from '../types/workout';
import { ExerciseType } from '../types/exercise';
import { EXERCISE_CONFIGS } from '../services/mockData';

import { storageService } from '../services/storageService';

export interface DashboardPageProps {
  user: UserProfile;
  monthlyStats: MonthlyStats;
  onSelectExercise: (exerciseId: string) => void;
  onSelectSession: (session: WorkoutSession) => void;
  onViewProgress: () => void;
  onBack?: () => void;
}

export function DashboardPage({
  user,
  monthlyStats,
  onSelectExercise,
  onSelectSession,
  onViewProgress,
  onBack,
}: DashboardPageProps) {
  const exercises = Object.values(EXERCISE_CONFIGS);

  // Extract actual registered name from authenticated profile
  const athleteName = user.name || 'Athlete';

  // Real week active days
  const activeDays = storageService.getCurrentWeekActiveDays(user.recentWorkouts || []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 space-y-5 sm:space-y-6">
      {/* Top Back Navigation (if available) */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Top Welcome & Direct Primary CTA Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
              Welcome back, {athleteName}
            </h1>
            <Badge variant="neon" size="sm" dot>Active Athlete</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Your personal AI computer-vision training hub.
          </p>
        </div>

        {/* Prominent Direct Workout CTA */}
        <div className="flex items-center gap-3">
          <Button
            variant="glow"
            size="md"
            onClick={() => onSelectExercise('pushups')}
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            className="shadow-light-blue w-full sm:w-auto"
          >
            Start AI Workout
          </Button>
        </div>
      </div>

      {/* 4 Real Stats Widgets Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsWidget
          title="Verified Reps"
          value={monthlyStats.totalReps.toLocaleString()}
          subtitle="All-time verified"
          icon={<ShieldCheck className="w-4 h-4 text-blue-600 dark:text-brand-neon" />}
          accentColor="blue"
        />

        <StatsWidget
          title="Workouts Completed"
          value={monthlyStats.totalWorkouts.toString()}
          subtitle="Total finished sessions"
          icon={<Calendar className="w-4 h-4 text-sky-600 dark:text-brand-cyan" />}
          accentColor="cyan"
        />

        <StatsWidget
          title="Active Daily Streak"
          value={`${user.currentStreak} ${user.currentStreak === 1 ? 'day' : 'days'}`}
          subtitle="Consecutive training"
          icon={<Flame className="w-4 h-4 text-orange-500 dark:text-amber-400" />}
          accentColor="amber"
        />

        <StatsWidget
          title="Longest Benchmark"
          value={`${user.longestStreak} ${user.longestStreak === 1 ? 'day' : 'days'}`}
          subtitle="All-time record streak"
          icon={<Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          accentColor="purple"
        />
      </div>

      {/* Ready to Train / Quick Launch Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">Ready to Train?</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Launch real-time pose tracking for your chosen movement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((ex) => (
            <QuickStartCard
              key={ex.id}
              exercise={ex}
              personalBest={user.personalBests?.[ex.id as ExerciseType]?.maxReps ?? 0}
              onSelect={() => onSelectExercise(ex.id)}
            />
          ))}
        </div>
      </div>

      {/* Streak & Volume Trajectory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        <div className="lg:col-span-5 flex">
          <StreakCard
            className="w-full flex flex-col justify-between"
            currentStreak={user.currentStreak}
            longestStreak={user.longestStreak}
            activeDays={activeDays}
            onViewDetails={onViewProgress}
          />
        </div>

        <div className="lg:col-span-7 flex">
          <WeeklyVolumeChart
            className="w-full flex flex-col justify-between"
            dailyBreakdown={monthlyStats.dailyBreakdown}
          />
        </div>
      </div>

      {/* Personal Records & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        <div className="lg:col-span-5 flex">
          <div className="w-full flex flex-col">
            <PersonalBestsGrid
              personalBests={user.personalBests}
              onSelectExercise={onSelectExercise}
            />
          </div>
        </div>

        <div className="lg:col-span-7 flex">
          <div className="w-full flex flex-col">
            <RecentWorkoutsList
              sessions={user.recentWorkouts}
              onSelectSession={onSelectSession}
              onViewAll={onViewProgress}
              onStartWorkout={() => onSelectExercise('pushups')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
