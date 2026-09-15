import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Sparkles, Camera, ShieldCheck, ArrowRight } from 'lucide-react';
import { PUSHUP_CONFIG, SITUP_CONFIG } from '../../engine/exercises/exerciseConfig';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export interface ShowMeHowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExercise?: 'pushups' | 'situps';
}

export function ShowMeHowModal({
  isOpen,
  onClose,
  initialExercise = 'pushups',
}: ShowMeHowModalProps) {
  const [selectedTab, setSelectedTab] = useState<'pushups' | 'situps'>(initialExercise);

  useEffect(() => {
    if (isOpen) {
      setSelectedTab(initialExercise);
    }
  }, [isOpen, initialExercise]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-surface-200/95 border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto transition-colors"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-surface-100/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-brand-neon/10 dark:text-brand-neon border border-blue-200 dark:border-brand-neon/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                  AI Repetition Guide
                  <Badge variant="cyan" size="sm">Real-Time CV Rules</Badge>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Exact body positions, joint angles, and camera angles required for validated reps.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Exercise Tabs */}
          <div className="px-6 pt-4 bg-slate-100/60 dark:bg-surface-100/40 border-b border-slate-200 dark:border-white/5 flex gap-2">
            <button
              onClick={() => setSelectedTab('pushups')}
              className={cn(
                'px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold font-display transition-all border-b-2 flex items-center gap-2 cursor-pointer',
                selectedTab === 'pushups'
                  ? 'border-blue-600 text-blue-600 dark:border-brand-neon dark:text-white bg-white dark:bg-surface-50/80 shadow-sm dark:shadow-[0_-2px_10px_rgba(0,245,160,0.15)]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <span>Push-ups</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-100 text-blue-600 dark:text-brand-neon font-bold">
                &ge;{PUSHUP_CONFIG.lockoutAngle}&deg; &rarr; &le;{PUSHUP_CONFIG.depthAngle}&deg;
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('situps')}
              className={cn(
                'px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold font-display transition-all border-b-2 flex items-center gap-2 cursor-pointer',
                selectedTab === 'situps'
                  ? 'border-cyan-600 text-cyan-600 dark:border-brand-cyan dark:text-white bg-white dark:bg-surface-50/80 shadow-sm dark:shadow-[0_-2px_10px_rgba(0,217,245,0.15)]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <span>Sit-ups</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-100 text-cyan-600 dark:text-brand-cyan font-bold">
                &ge;{SITUP_CONFIG.lyingAngle}&deg; &rarr; &le;{SITUP_CONFIG.uprightAngle}&deg;
              </span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            {selectedTab === 'pushups' ? (
              <PushupGuideContent />
            ) : (
              <SitupGuideContent />
            )}
          </div>

          {/* Footer Action */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-surface-100/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Single Source of Truth AI Geometry</span>
            </div>
            <Button variant="glow" size="md" onClick={onClose} className="cursor-pointer">
              Got It — Let&apos;s Workout
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Visual 6-Stage Push-up Guide with Dynamic Configuration Values
 */
function PushupGuideContent() {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-brand-neon/5 border border-blue-200 dark:border-brand-neon/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-blue-700 dark:text-brand-neon font-bold tracking-wider">
            Movement Signature
          </span>
          <p className="text-sm text-slate-800 dark:text-slate-200">
            A repetition requires a stable horizontal plank, full descent past <strong className="text-blue-600 dark:text-brand-neon">{PUSHUP_CONFIG.depthAngle}&deg;</strong> elbow bend, and return to full lockout (<strong className="text-blue-600 dark:text-brand-neon">&ge;{PUSHUP_CONFIG.lockoutAngle}&deg;</strong>).
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-surface-50 border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-sm">
          <span>Min ROM: <strong className="text-blue-600 dark:text-brand-neon">{PUSHUP_CONFIG.minRangeOfMotion}&deg;</strong></span>
        </div>
      </div>

      {/* 6 Visual Movement Stages */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-4">
          6-Stage Kinematic Cycle
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Stage 1 */}
          <StageCard
            number="01"
            title="Ready (Lockout)"
            badge={`Elbow ≥ ${PUSHUP_CONFIG.lockoutAngle}°`}
            description="Hold stable horizontal plank. Arms straight, core braced."
            arrowText="Arms Locked"
            badgeColor="neon"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                {/* Floor */}
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                {/* Body straight line: Shoulder (50, 40) -> Hip (110, 43) -> Ankle (170, 48) */}
                <line x1="50" y1="40" x2="110" y2="43" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="110" y1="43" x2="170" y2="48" stroke="#00F5A0" strokeWidth="3.5" />
                {/* Arm: Shoulder (50, 40) -> Elbow (50, 56) -> Wrist (50, 73) */}
                <line x1="50" y1="40" x2="50" y2="73" stroke="#00D9F5" strokeWidth="3.5" />
                {/* Joints */}
                <circle cx="50" cy="40" r="4.5" fill="#00D9F5" />
                <circle cx="50" cy="56" r="3.5" fill="#00F5A0" />
                <circle cx="50" cy="73" r="4" fill="#00D9F5" />
                <circle cx="110" cy="43" r="4" fill="#00F5A0" />
                <circle cx="170" cy="48" r="4" fill="#00F5A0" />
                {/* Head */}
                <circle cx="35" cy="36" r="6" fill="#64748B" />
              </svg>
            }
          />

          {/* Stage 2 */}
          <StageCard
            number="02"
            title="Controlled Descent"
            badge="Downward Velocity"
            description="Lower chest smoothly. Maintain straight spine without hip sag."
            arrowText="Downward Drive ↓"
            badgeColor="cyan"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50" y1="50" x2="110" y2="52" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="110" y1="52" x2="170" y2="55" stroke="#00F5A0" strokeWidth="3.5" />
                {/* Bending arm */}
                <line x1="50" y1="50" x2="40" y2="60" stroke="#00D9F5" strokeWidth="3.5" />
                <line x1="40" y1="60" x2="50" y2="73" stroke="#00D9F5" strokeWidth="3.5" />
                <circle cx="50" cy="50" r="4" fill="#00D9F5" />
                <circle cx="40" cy="60" r="4" fill="#00F5A0" />
                <circle cx="50" cy="73" r="4" fill="#00D9F5" />
                <circle cx="110" cy="52" r="4" fill="#00F5A0" />
                <circle cx="170" cy="55" r="4" fill="#00F5A0" />
                <circle cx="35" cy="46" r="6" fill="#64748B" />
                {/* Motion arrow */}
                <path d="M 50 30 L 50 42 M 46 38 L 50 42 L 54 38" stroke="#00D9F5" strokeWidth="2" fill="none" />
              </svg>
            }
          />

          {/* Stage 3 */}
          <StageCard
            number="03"
            title="Target Depth"
            badge={`Elbow ≤ ${PUSHUP_CONFIG.depthAngle}°`}
            description={`Chest reaches deep bottom. Elbow flexes to ≤ ${PUSHUP_CONFIG.depthAngle}°.`}
            arrowText="Depth Verified"
            badgeColor="neon"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                {/* Deep bottom: body close to floor */}
                <line x1="50" y1="60" x2="110" y2="61" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="110" y1="61" x2="170" y2="63" stroke="#00F5A0" strokeWidth="3.5" />
                {/* Elbow bent at 90 deg: Shoulder (50, 60) -> Elbow (33, 62) -> Wrist (50, 73) */}
                <line x1="50" y1="60" x2="33" y2="62" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="33" y1="62" x2="50" y2="73" stroke="#00F5A0" strokeWidth="3.5" />
                <circle cx="50" cy="60" r="4" fill="#00D9F5" />
                <circle cx="33" cy="62" r="5" fill="#00F5A0" />
                <circle cx="50" cy="73" r="4" fill="#00D9F5" />
                <circle cx="110" cy="61" r="4" fill="#00F5A0" />
                <circle cx="170" cy="63" r="4" fill="#00F5A0" />
                <circle cx="35" cy="56" r="6" fill="#64748B" />
              </svg>
            }
          />

          {/* Stage 4 */}
          <StageCard
            number="04"
            title="Drive Up"
            badge="Upward Velocity"
            description="Push forcefully through palms. Spine stays in straight alignment."
            arrowText="Ascent Drive ↑"
            badgeColor="amber"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50" y1="48" x2="110" y2="50" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="110" y1="50" x2="170" y2="53" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="50" y1="48" x2="42" y2="58" stroke="#F59E0B" strokeWidth="3.5" />
                <line x1="42" y1="58" x2="50" y2="73" stroke="#F59E0B" strokeWidth="3.5" />
                <circle cx="50" cy="48" r="4" fill="#00D9F5" />
                <circle cx="42" cy="58" r="4" fill="#F59E0B" />
                <circle cx="50" cy="73" r="4" fill="#00D9F5" />
                <circle cx="110" cy="50" r="4" fill="#00F5A0" />
                <circle cx="170" cy="53" r="4" fill="#00F5A0" />
                <circle cx="35" cy="44" r="6" fill="#64748B" />
                <path d="M 50 38 L 50 26 M 46 30 L 50 26 L 54 30" stroke="#F59E0B" strokeWidth="2" fill="none" />
              </svg>
            }
          />

          {/* Stage 5 */}
          <StageCard
            number="05"
            title="Lockout Reset"
            badge={`Elbow ≥ ${PUSHUP_CONFIG.lockoutAngle}°`}
            description="Fully extend arms at top to complete cycle."
            arrowText="Lockout Held"
            badgeColor="neon"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50" y1="40" x2="110" y2="43" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="110" y1="43" x2="170" y2="48" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="50" y1="40" x2="50" y2="73" stroke="#00F5A0" strokeWidth="3.5" />
                <circle cx="50" cy="40" r="4.5" fill="#00F5A0" />
                <circle cx="50" cy="56" r="3.5" fill="#00F5A0" />
                <circle cx="50" cy="73" r="4" fill="#00D9F5" />
                <circle cx="110" cy="43" r="4" fill="#00F5A0" />
                <circle cx="170" cy="48" r="4" fill="#00F5A0" />
                <circle cx="35" cy="36" r="6" fill="#64748B" />
              </svg>
            }
          />

          {/* Stage 6 */}
          <StageCard
            number="06"
            title="Rep Counted"
            badge="✓ Valid Rep"
            description="Full movement signature confirmed! Counter increments by +1."
            arrowText="+1 Valid Rep"
            badgeColor="emerald"
            svg={
              <div className="w-full h-24 flex flex-col items-center justify-center bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-brand-neon mb-1">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold font-mono text-emerald-300 uppercase">
                  Repetition Authenticated
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* DOs and DONTs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DOs */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 space-y-3">
          <h5 className="text-xs uppercase font-mono font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Technique Checkpoints (DO)
          </h5>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">&bull;</span>
              <span>Keep camera at floor level 6-8 ft away capturing full side profile.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">&bull;</span>
              <span>Descend smoothly until elbows reach &le; {PUSHUP_CONFIG.depthAngle}&deg;.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">&bull;</span>
              <span>Push all the way back up to straight arms (&ge; {PUSHUP_CONFIG.lockoutAngle}&deg;).</span>
            </li>
          </ul>
        </div>

        {/* DONTs */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 space-y-3">
          <h5 className="text-xs uppercase font-mono font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Common Mistakes (DON&apos;T)
          </h5>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold">&bull;</span>
              <span>Half reps returning before reaching {PUSHUP_CONFIG.depthAngle}&deg; depth (rejected).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold">&bull;</span>
              <span>Sagging hips or piking butt high into the air.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold">&bull;</span>
              <span>Standing upright or moving arms while standing.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual 6-Stage Sit-up Guide with Dynamic Configuration Values
 */
function SitupGuideContent() {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-cyan-50/80 dark:bg-brand-cyan/5 border border-cyan-200 dark:border-brand-cyan/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-cyan-800 dark:text-brand-cyan font-bold tracking-wider">
            Movement Signature
          </span>
          <p className="text-sm text-slate-800 dark:text-slate-200">
            A repetition begins lying flat (<strong className="text-cyan-700 dark:text-brand-cyan">&ge;{SITUP_CONFIG.lyingAngle}&deg;</strong>), curls up into upright flexion (<strong className="text-cyan-700 dark:text-brand-cyan">&le;{SITUP_CONFIG.uprightAngle}&deg;</strong>), and resets flat on the floor.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-surface-50 border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-sm">
          <span>Knee Bend: <strong className="text-cyan-700 dark:text-brand-cyan">{SITUP_CONFIG.minKneeBendAngle}&deg;&ndash;{SITUP_CONFIG.maxKneeBendAngle}&deg;</strong></span>
        </div>
      </div>

      {/* 6 Visual Movement Stages */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-4">
          6-Stage Kinematic Cycle
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Stage 1 */}
          <StageCard
            number="01"
            title="Ready (Lying Flat)"
            badge={`Torso ≥ ${SITUP_CONFIG.lyingAngle}°`}
            description="Start flat on your back on the mat. Knees bent at ~90°, feet planted."
            arrowText="Lying Stable"
            badgeColor="cyan"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                {/* Flat on back: Shoulder (40, 71) -> Hip (100, 71) -> Knee (135, 52) -> Ankle (165, 72) */}
                <line x1="40" y1="71" x2="100" y2="71" stroke="#00D9F5" strokeWidth="3.5" />
                <line x1="100" y1="71" x2="135" y2="52" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="135" y1="52" x2="165" y2="72" stroke="#00F5A0" strokeWidth="3.5" />
                <circle cx="40" cy="71" r="4.5" fill="#00D9F5" />
                <circle cx="100" cy="71" r="4" fill="#00D9F5" />
                <circle cx="135" cy="52" r="4" fill="#00F5A0" />
                <circle cx="165" cy="72" r="4" fill="#00F5A0" />
                <circle cx="28" cy="68" r="6" fill="#64748B" />
              </svg>
            }
          />

          {/* Stage 2 */}
          <StageCard
            number="02"
            title="Curling Up"
            badge="Abdominal Flexion"
            description="Contract your core to lift shoulders and upper back off the mat."
            arrowText="Curling Upward ↑"
            badgeColor="cyan"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                {/* Torso rising: Shoulder (60, 56) -> Hip (100, 71) */}
                <line x1="60" y1="56" x2="100" y2="71" stroke="#00D9F5" strokeWidth="3.5" />
                <line x1="100" y1="71" x2="135" y2="52" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="135" y1="52" x2="165" y2="72" stroke="#00F5A0" strokeWidth="3.5" />
                <circle cx="60" cy="56" r="4.5" fill="#00D9F5" />
                <circle cx="100" cy="71" r="4" fill="#00D9F5" />
                <circle cx="135" cy="52" r="4" fill="#00F5A0" />
                <circle cx="165" cy="72" r="4" fill="#00F5A0" />
                <circle cx="48" cy="50" r="6" fill="#64748B" />
                {/* Curving arrow */}
                <path d="M 40 68 Q 50 48 65 42" stroke="#00D9F5" strokeWidth="2" fill="none" />
                <path d="M 60 40 L 66 42 L 64 48" stroke="#00D9F5" strokeWidth="2" fill="none" />
              </svg>
            }
          />

          {/* Stage 3 */}
          <StageCard
            number="03"
            title="Upright Peak"
            badge={`Torso ≤ ${SITUP_CONFIG.uprightAngle}°`}
            description={`Bring chest close to knees. Torso angle reaches ≤ ${SITUP_CONFIG.uprightAngle}°.`}
            arrowText="Peak Reached"
            badgeColor="neon"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                {/* Upright peak: Shoulder (95, 38) -> Hip (100, 71) */}
                <line x1="95" y1="38" x2="100" y2="71" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="100" y1="71" x2="135" y2="52" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="135" y1="52" x2="165" y2="72" stroke="#00F5A0" strokeWidth="3.5" />
                <circle cx="95" cy="38" r="4.5" fill="#00F5A0" />
                <circle cx="100" cy="71" r="4" fill="#00D9F5" />
                <circle cx="135" cy="52" r="4" fill="#00F5A0" />
                <circle cx="165" cy="72" r="4" fill="#00F5A0" />
                <circle cx="92" cy="26" r="6" fill="#64748B" />
              </svg>
            }
          />

          {/* Stage 4 */}
          <StageCard
            number="04"
            title="Controlled Lowering"
            badge="Downward Velocity"
            description="Lower your upper body back under control without bouncing."
            arrowText="Lowering Back ↓"
            badgeColor="amber"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="65" y1="54" x2="100" y2="71" stroke="#F59E0B" strokeWidth="3.5" />
                <line x1="100" y1="71" x2="135" y2="52" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="135" y1="52" x2="165" y2="72" stroke="#00F5A0" strokeWidth="3.5" />
                <circle cx="65" cy="54" r="4" fill="#F59E0B" />
                <circle cx="100" cy="71" r="4" fill="#00D9F5" />
                <circle cx="135" cy="52" r="4" fill="#00F5A0" />
                <circle cx="165" cy="72" r="4" fill="#00F5A0" />
                <circle cx="54" cy="48" r="6" fill="#64748B" />
                <path d="M 80 40 Q 65 50 50 68" stroke="#F59E0B" strokeWidth="2" fill="none" />
                <path d="M 55 68 L 50 68 L 50 62" stroke="#F59E0B" strokeWidth="2" fill="none" />
              </svg>
            }
          />

          {/* Stage 5 */}
          <StageCard
            number="05"
            title="Reset to Mat"
            badge={`Torso ≥ ${SITUP_CONFIG.lyingAngle}°`}
            description="Shoulders touch the mat completely before starting the next rep."
            arrowText="Reset Verified"
            badgeColor="cyan"
            svg={
              <svg viewBox="0 0 200 90" className="w-full h-24">
                <line x1="10" y1="75" x2="190" y2="75" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="40" y1="71" x2="100" y2="71" stroke="#00D9F5" strokeWidth="3.5" />
                <line x1="100" y1="71" x2="135" y2="52" stroke="#00F5A0" strokeWidth="3.5" />
                <line x1="135" y1="52" x2="165" y2="72" stroke="#00F5A0" strokeWidth="3.5" />
                <circle cx="40" cy="71" r="4.5" fill="#00D9F5" />
                <circle cx="100" cy="71" r="4" fill="#00D9F5" />
                <circle cx="135" cy="52" r="4" fill="#00F5A0" />
                <circle cx="165" cy="72" r="4" fill="#00F5A0" />
                <circle cx="28" cy="68" r="6" fill="#64748B" />
              </svg>
            }
          />

          {/* Stage 6 */}
          <StageCard
            number="06"
            title="Rep Counted"
            badge="✓ Valid Sit-up"
            description="Full curl-up and reset verified! Counter increments by +1."
            arrowText="+1 Valid Sit-up"
            badgeColor="emerald"
            svg={
              <div className="w-full h-24 flex flex-col items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-brand-cyan mb-1">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold font-mono text-cyan-300 uppercase">
                  Repetition Authenticated
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* DOs and DONTs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DOs */}
        <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/20 space-y-3">
          <h5 className="text-xs uppercase font-mono font-bold text-cyan-800 dark:text-brand-cyan flex items-center gap-1.5">
            <Check className="w-4 h-4 text-cyan-600 dark:text-brand-cyan" /> Technique Checkpoints (DO)
          </h5>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 dark:text-brand-cyan font-bold">&bull;</span>
              <span>Keep camera at floor/mat level in clear side view showing head to feet.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 dark:text-brand-cyan font-bold">&bull;</span>
              <span>Curl all the way up until torso reaches &le; {SITUP_CONFIG.uprightAngle}&deg;.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 dark:text-brand-cyan font-bold">&bull;</span>
              <span>Lower back down until shoulder blades touch the floor (&ge; {SITUP_CONFIG.lyingAngle}&deg;).</span>
            </li>
          </ul>
        </div>

        {/* DONTs */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 space-y-3">
          <h5 className="text-xs uppercase font-mono font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Common Mistakes (DON&apos;T)
          </h5>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold">&bull;</span>
              <span>Starting while already sitting upright (must start flat on back).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold">&bull;</span>
              <span>Partial crunch without reaching upright position (rejected).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold">&bull;</span>
              <span>Standing upright or bending at hips while standing.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Diagrammatic Stage Card
 */
function StageCard({
  number,
  title,
  badge,
  description,
  arrowText,
  badgeColor = 'cyan',
  svg,
}: {
  number: string;
  title: string;
  badge: string;
  description: string;
  arrowText: string;
  badgeColor?: 'neon' | 'cyan' | 'amber' | 'emerald';
  svg: React.ReactNode;
}) {
  const badgeClasses = {
    neon: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-brand-neon dark:border-emerald-500/30',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-brand-cyan dark:border-cyan-500/30',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-surface-100/70 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-slate-500">{number}</span>
        <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold border', badgeClasses[badgeColor])}>
          {badge}
        </span>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="bg-white dark:bg-surface-50/80 rounded-xl p-2 border border-slate-200/60 dark:border-white/5 flex items-center justify-center shadow-inner">
        {svg}
      </div>

      <div>
        <h5 className="text-sm font-bold text-slate-900 dark:text-white font-display">{title}</h5>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
        <span>Kinematics</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">{arrowText}</span>
      </div>
    </div>
  );
}
