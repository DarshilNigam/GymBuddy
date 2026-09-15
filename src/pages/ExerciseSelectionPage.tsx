import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Play,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { ExerciseType, ExerciseConfig } from '../types/exercise';
import { EXERCISE_CONFIGS } from '../services/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ShowMeHowModal } from '../components/workout/ShowMeHowModal';

export interface ExerciseSelectionPageProps {
  onSelectExercise: (exerciseId: ExerciseType) => void;
  onBack: () => void;
}

export function ExerciseSelectionPage({ onSelectExercise, onBack }: ExerciseSelectionPageProps) {
  const [selectedId, setSelectedId] = useState<ExerciseType>('pushups');
  const [modalExercise, setModalExercise] = useState<ExerciseType | null>(null);

  const exercises = Object.values(EXERCISE_CONFIGS);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-4 sm:pb-5 space-y-2.5 sm:space-y-3">
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Header & Eyebrow */}
      <div className="text-center max-w-2xl mx-auto space-y-0.5 sm:space-y-1">
        <Badge variant="cyan" size="sm">AI TRAINING</Badge>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
          Choose Your AI Workout
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-normal">
          Select an exercise to initialize real-time joint kinematic verification and anti-false-positive repetition counting.
        </p>
      </div>

      {/* Two Premium Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 items-stretch">
        {exercises.map((exercise) => {
          const isSelected = exercise.id === selectedId;
          const isPush = exercise.id === 'pushups';

          return (
            <div
              key={exercise.id}
              onClick={() => setSelectedId(exercise.id as ExerciseType)}
              className={`rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden group p-3.5 sm:p-4 lg:p-5 h-full ${
                isSelected
                  ? 'bg-white border-brand-primary shadow-light-hover dark:bg-surface-100 dark:border-brand-neon dark:shadow-glow-neon ring-4 ring-blue-500/10 dark:ring-emerald-500/10'
                  : 'bg-white/90 border-slate-200 shadow-light-card hover:border-slate-300 hover:shadow-md dark:bg-surface-100/60 dark:border-white/10 dark:hover:border-white/20'
              }`}
            >
              {/* Top Section */}
              <div className="space-y-2 sm:space-y-2.5">
                {/* Header Badge & Category */}
                <div className="flex items-center justify-between gap-2 pb-2 sm:pb-2.5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Badge variant={isPush ? 'blue' : 'cyan'} size="sm">
                      {isPush ? 'Upper-Body Strength' : 'Core Strength'}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      {exercise.difficulty}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-bold text-brand-primary dark:text-brand-neon bg-blue-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selected
                    </span>
                  )}
                </div>

                {/* Visual Representation Graphic Box */}
                <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-2.5 sm:p-3 flex flex-col justify-between gap-1 sm:gap-1.5 relative overflow-hidden group-hover:border-blue-400/40 dark:group-hover:border-brand-neon/40 transition-colors">
                  {/* Subtle Grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  {/* Top Status inside Graphic */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      {isPush ? 'Elbow Kinematics' : 'Torso Elevation'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {isPush ? '90° DEPTH TARGET' : '65° ASCENT TARGET'}
                    </span>
                  </div>

                  {/* SVG Skeletal Movement Representation */}
                  <div className="relative z-10 flex items-center justify-center py-0.5">
                    {isPush ? (
                      <svg viewBox="0 0 240 120" className="w-full max-h-[54px] sm:max-h-[60px] drop-shadow-[0_0_8px_rgba(0,245,160,0.3)]">
                        {/* Body Torso line */}
                        <line x1="80" y1="50" x2="140" y2="60" stroke="#00D9F5" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Arm Upper */}
                        <line x1="80" y1="50" x2="60" y2="85" stroke="#00F5A0" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Arm Forearm */}
                        <line x1="60" y1="85" x2="75" y2="105" stroke="#00F5A0" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Legs */}
                        <line x1="140" y1="60" x2="190" y2="80" stroke="#00D9F5" strokeWidth="3.5" strokeLinecap="round" />
                        <line x1="190" y1="80" x2="220" y2="105" stroke="#00D9F5" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Landmark Nodes */}
                        <circle cx="55" cy="40" r="7" fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="80" cy="50" r="4" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="60" cy="85" r="5" fill="#F59E0B" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="75" cy="105" r="4" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="140" cy="60" r="4" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="190" cy="80" r="4" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="220" cy="105" r="4" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 240 120" className="w-full max-h-[54px] sm:max-h-[60px] drop-shadow-[0_0_8px_rgba(0,217,245,0.3)]">
                        {/* Torso inclined */}
                        <line x1="100" y1="50" x2="130" y2="100" stroke="#00D9F5" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Thigh */}
                        <line x1="130" y1="100" x2="175" y2="65" stroke="#00F5A0" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Shin */}
                        <line x1="175" y1="65" x2="200" y2="105" stroke="#00F5A0" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Arms forward */}
                        <line x1="100" y1="50" x2="135" y2="55" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Landmark Nodes */}
                        <circle cx="85" cy="35" r="7" fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="100" cy="50" r="4" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="130" cy="100" r="5" fill="#F59E0B" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="175" cy="65" r="4" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="200" cy="105" r="4" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="135" cy="55" r="4" fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" />
                      </svg>
                    )}
                  </div>

                  {/* Bottom Feature Tag */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{isPush ? 'Shoulder-Elbow-Wrist Vector' : 'Shoulder-Hip-Knee Vector'}</span>
                    <span className="text-sky-400">Strict Verification</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 shrink-0 ${
                        isPush
                          ? 'bg-blue-50 border-blue-200 text-brand-primary dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-brand-neon'
                          : 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-brand-cyan'
                      }`}
                    >
                      {isPush ? <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display leading-tight">
                        {exercise.name}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                        {isPush ? 'Horizontal Pressing Movement' : 'Core Flexion Movement'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    {exercise.description}
                  </p>

                  {/* Target Muscles */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {exercise.targetMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 font-medium dark:bg-surface-50 dark:border-white/5 dark:text-slate-300"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-2.5 sm:mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalExercise(exercise.id as ExerciseType);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-primary dark:text-slate-400 dark:hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-brand-cyan" />
                  <span>Show Me How</span>
                </button>

                <Button
                  variant={isSelected ? 'glow' : 'secondary'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExercise(exercise.id as ExerciseType);
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="shrink-0 shadow-light-blue py-2 px-3.5 text-xs font-bold"
                >
                  Train {exercise.name} →
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show Me How Visual Guide Modal */}
      <ShowMeHowModal
        isOpen={modalExercise !== null}
        onClose={() => setModalExercise(null)}
        initialExercise={modalExercise === 'situps' ? 'situps' : 'pushups'}
      />
    </div>
  );
}
