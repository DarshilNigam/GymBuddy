import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Play,
  ShieldCheck,
  Eye,
  Cpu,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Lock,
  Zap,
  Camera,
  Layers,
  GitBranch,
  Check,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export interface LandingPageProps {
  onStart: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateDashboard: () => void;
  isAuthenticated?: boolean;
}

export function LandingPage({
  onStart,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateDashboard,
  isAuthenticated = false,
}: LandingPageProps) {
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 pb-16">
      {/* =========================================================================
          PAGE 1 — HERO / INTRODUCTION
          Main Concept: GymBuddy AI-powered workout tracking with verified computer vision
          ========================================================================= */}
      <section
        id="hero"
        className="scroll-mt-24 min-h-[calc(100vh-5rem)] flex flex-col justify-between py-6 sm:py-10 relative overflow-hidden"
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-blue-400/10 dark:bg-brand-neon/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-sky-400/10 dark:bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10 my-auto">
          {/* Left Column: Hero Messaging */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2"
            >
              <Badge variant="cyan" size="md" dot>
                Edge Computer Vision Fitness
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-[1.12]"
            >
              Real-Time AI Workout & <br />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-brand-neon dark:via-brand-cyan dark:to-blue-400 bg-clip-text text-transparent">
                Precision Rep Counter
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg font-normal leading-relaxed"
            >
              Zero simulated counting. GymBuddy uses edge computer vision to analyze 33 anatomical 3D joints and validate every repetition in real time.
            </motion.p>

            {/* Trust Metrics */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg border-t border-slate-200/80 dark:border-white/8">
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">100%</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Strict CV Counting</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-brand-neon font-display">60 FPS</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Edge Processing</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-brand-cyan font-display">0.1°</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Angle Precision</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-display">100%</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">On-Device Privacy</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive AI Kinematic Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="rounded-2xl bg-white dark:bg-surface-100/90 border border-slate-200/90 dark:border-white/10 p-5 shadow-light-card space-y-4">
              {/* HUD Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    MediaPipe Pose Engine
                  </span>
                </div>
                <Badge variant="cyan" size="sm">60 FPS Edge</Badge>
              </div>

              {/* Dynamic Pose Skeleton Overlay */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800 p-3 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 300 180" className="w-full h-full max-h-[130px] drop-shadow-[0_0_10px_rgba(0,217,245,0.4)]">
                    {/* Torso line */}
                    <line x1="100" y1="80" x2="160" y2="95" stroke="#00D9F5" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Upper arm */}
                    <line x1="100" y1="80" x2="80" y2="120" stroke="#00F5A0" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Forearm to ground */}
                    <line x1="80" y1="120" x2="95" y2="150" stroke="#00F5A0" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Upper leg */}
                    <line x1="160" y1="95" x2="220" y2="120" stroke="#00D9F5" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Lower leg */}
                    <line x1="220" y1="120" x2="255" y2="150" stroke="#00D9F5" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Landmarks */}
                    <circle cx="70" cy="72" r="8" fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="100" cy="80" r="4.5" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="80" cy="120" r="6" fill="#F59E0B" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                    <circle cx="95" cy="150" r="4.5" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="160" cy="95" r="4.5" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="220" cy="120" r="4.5" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="255" cy="150" r="4.5" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Top Right HUD Angle Pill */}
                <div className="absolute top-2.5 right-2.5 bg-slate-900/90 border border-emerald-500/40 px-2.5 py-1 rounded-lg shadow flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] font-mono font-bold text-emerald-400">90.4° ELBOW</span>
                </div>

                {/* Bottom Left HUD State Pill */}
                <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 border border-cyan-500/40 px-2.5 py-1 rounded-lg shadow flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span className="text-[11px] font-mono font-bold text-cyan-400">DEPTH REACHED</span>
                </div>
              </div>

              {/* Bottom Telemetry Card Bar */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 dark:bg-surface-50 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                    Validated Reps
                  </span>
                  <div className="text-xl font-black font-display text-brand-primary dark:text-brand-neon">
                    12 <span className="text-xs font-normal text-slate-500">REPS</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 dark:bg-surface-50 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                    Form Score
                  </span>
                  <div className="text-xl font-black font-display text-sky-600 dark:text-brand-cyan">
                    94% <span className="text-xs font-normal text-slate-500">ELITE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Page 1 Bottom Next-Action Navigation CTAs */}
        <div className="pt-8 pb-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center relative z-10">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => scrollToSection('methodology')}
            rightIcon={<ArrowDown className="w-4 h-4" />}
            className="shadow-sm w-full sm:w-auto min-w-[200px]"
          >
            See How It Works ↓
          </Button>

          <Button
            variant="glow"
            size="lg"
            onClick={onStart}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-light-blue w-full sm:w-auto min-w-[220px]"
          >
            Begin Your Experience →
          </Button>
        </div>
      </section>

      {/* =========================================================================
          PAGE 2 — METHODOLOGY / HOW IT WORKS
          Main Concept: The GymBuddy Method (Capture -> Understand -> Verify)
          ========================================================================= */}
      <section
        id="methodology"
        className="scroll-mt-24 min-h-[calc(100vh-5rem)] flex flex-col justify-center pt-6 sm:pt-10 pb-10 sm:pb-16 space-y-8 sm:space-y-9"
      >
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <Badge variant="cyan" size="sm">Methodology</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            THE GYMBUDDY METHOD
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            A three-phase sequential computer-vision process that converts live camera video into verified repetitions without wearable hardware.
          </p>
        </div>

        {/* 3 Connected Sequential Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Card 01 — CAPTURE */}
          <Card className="p-6 space-y-5 bg-white border-slate-200/90 shadow-light-card hover:shadow-light-hover dark:bg-surface-100/70 dark:border-white/8 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-primary dark:bg-brand-neon/10 dark:border-brand-neon/20 dark:text-brand-neon">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-brand-primary border border-blue-200 dark:bg-emerald-500/10 dark:text-brand-neon dark:border-emerald-500/20">
                  01
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Capture
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Camera observes your movement
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  Place your device 6–8 feet away. GymBuddy captures high-framerate optical frames directly in the browser with zero server streaming.
                </p>
              </div>
            </div>

            {/* Visual Micro-Diagram */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-brand-neon" />
                Optical Stream
              </span>
              <span className="text-emerald-600 dark:text-brand-neon font-bold">60 FPS Native</span>
            </div>
          </Card>

          {/* Card 02 — UNDERSTAND */}
          <Card className="p-6 space-y-5 bg-white border-slate-200/90 shadow-light-card hover:shadow-light-hover dark:bg-surface-100/70 dark:border-white/8 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 dark:bg-brand-cyan/10 dark:border-brand-cyan/20 dark:text-brand-cyan">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 dark:bg-cyan-500/10 dark:text-brand-cyan dark:border-cyan-500/20">
                  02
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Understand
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  33 landmarks & joint angles
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  Edge computer vision computes sub-degree 3D joint vectors, tracking trajectory, velocity, and exercise phase transitions in real time.
                </p>
              </div>
            </div>

            {/* Visual Micro-Diagram */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-brand-cyan" />
                3D Keypoint Vectors
              </span>
              <span className="text-sky-600 dark:text-brand-cyan font-bold">33 Landmarks</span>
            </div>
          </Card>

          {/* Card 03 — VERIFY */}
          <Card className="p-6 space-y-5 bg-white border-slate-200/90 shadow-light-card hover:shadow-light-hover dark:bg-surface-100/70 dark:border-white/8 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                  03
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Verify
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Rep counting & form feedback
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  GymBuddy checks strict depth inflection and full lockout extension. Anti-spike filtering rejects noise, velocity jumps, and false reps.
                </p>
              </div>
            </div>

            {/* Visual Micro-Diagram */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-brand-neon" />
                Kinematic Rule Engine
              </span>
              <span className="text-purple-600 dark:text-brand-neon font-bold">Zero False Counts</span>
            </div>
          </Card>
        </div>

        {/* Page 2 Bottom CTA: Scroll to Page 3 */}
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => scrollToSection('architecture')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-sm min-w-[220px]"
          >
            View Architecture →
          </Button>
        </div>
      </section>

      {/* =========================================================================
          PAGE 3 — ARCHITECTURE
          Main Concept: Edge AI Computer-Vision Pipeline Structure
          ========================================================================= */}
      <section
        id="architecture"
        className="scroll-mt-24 min-h-[calc(100vh-5rem)] flex flex-col justify-center pt-6 sm:pt-10 pb-10 sm:pb-16 space-y-8 sm:space-y-9"
      >
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <Badge variant="neon" size="sm">Architecture</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            ENGINE PIPELINE ARCHITECTURE
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            The multi-stage mathematical processing pipeline executing on-device inside your browser.
          </p>
        </div>

        {/* Polished Architecture Pipeline Showcase Card */}
        <Card className="p-6 sm:p-8 bg-white dark:bg-surface-100/90 border-slate-200/90 dark:border-white/10 shadow-light-card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-brand-neon uppercase px-2 py-0.5 rounded bg-blue-100/70 dark:bg-brand-neon/10">
                  INPUT LAYER
                </span>
                <span className="text-xs font-mono text-slate-400">01</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Camera Optical Feed
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Captures raw RGB video frames at 60 FPS via WebRTC and delivers them directly into WebAssembly memory.
              </p>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <span>Latency: &lt;16ms</span>
                <span className="text-emerald-600 dark:text-brand-neon font-semibold">Local Memory</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-brand-cyan uppercase px-2 py-0.5 rounded bg-sky-100/70 dark:bg-brand-cyan/10">
                  POSE ESTIMATION
                </span>
                <span className="text-xs font-mono text-slate-400">02</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                33 3D Spatial Landmarks
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                MediaPipe Pose engine resolves 3D anatomical keypoints with individual confidence &amp; occlusion metrics.
              </p>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <span>Model: BlazePose WASM</span>
                <span className="text-sky-600 dark:text-brand-cyan font-semibold">33 Landmarks</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase px-2 py-0.5 rounded bg-purple-100/70 dark:bg-purple-500/10">
                  KINEMATICS
                </span>
                <span className="text-xs font-mono text-slate-400">03</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Vector Geometry &amp; Filters
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Computes 3D joint angle dot products with anti-spike velocity rejection and a 700ms occlusion grace window.
              </p>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <span>Velocity Cap: 650°/s</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">0.1° Precision</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-brand-neon uppercase px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-brand-neon/10">
                  STATE MACHINE
                </span>
                <span className="text-xs font-mono text-slate-400">04</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Repetition Verification
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Finite state machine enforces start lockout, inflection depth, and return extension before committing valid reps.
              </p>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <span>Anti-Spike: Active</span>
                <span className="text-emerald-600 dark:text-brand-neon font-semibold">100% Genuine</span>
              </div>
            </div>
          </div>

          {/* Connected Pipeline Flow Schematic */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 overflow-hidden relative">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Camera Feed</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Pose Engine</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <div className="flex items-center gap-2 text-slate-300">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Kinematics</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Rep</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Page 3 Bottom CTA: Scroll to Page 4 */}
        <div className="flex justify-center -mt-3 sm:-mt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => scrollToSection('get-started')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-sm min-w-[220px]"
          >
            Begin Your Experience →
          </Button>
        </div>
      </section>

      {/* =========================================================================
          PAGE 4 — GET STARTED
          Main Concept: Product Entry Experience with Premium SVG Visualization
          ========================================================================= */}
      <section
        id="get-started"
        className="scroll-mt-24 min-h-[calc(100vh-5rem)] flex flex-col justify-center py-6 sm:py-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-2xl mx-auto w-full rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-surface-100 dark:via-surface-100 dark:to-surface-50 p-5 sm:p-7 text-white overflow-hidden shadow-xl border border-blue-400/30 dark:border-white/10 space-y-4 sm:space-y-5"
        >
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <Badge variant="cyan" size="sm">Get Started</Badge>
            <h2 className="text-xl sm:text-3xl font-black font-display tracking-tight text-white">
              Ready to Train With Verified Computer Vision?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Step in front of your camera and experience authentic repetition counting.
            </p>
          </div>

          {/* Premium SVG Vector Visualization */}
          <div className="max-w-sm sm:max-w-md mx-auto aspect-[16/8] sm:aspect-[16/7] bg-slate-950/80 rounded-xl border border-white/15 p-3 sm:p-3.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-lg">
            {/* Viewfinder Corner Overlays */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-brand-primary dark:border-brand-neon" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-brand-primary dark:border-brand-neon" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-brand-primary dark:border-brand-neon" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-brand-primary dark:border-brand-neon" />

            {/* Top HUD Row */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-300 relative z-10">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE TRACKING ACTIVE
              </span>
              <span className="text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded text-[9px]">
                SUB-DEGREE PRECISION
              </span>
            </div>

            {/* Athlete Pose Skeleton SVG */}
            <div className="relative z-10 flex items-center justify-center my-auto">
              <svg viewBox="0 0 260 110" className="w-full max-h-[58px] sm:max-h-[66px] drop-shadow-[0_0_8px_rgba(0,245,160,0.35)]">
                {/* Torso line */}
                <line x1="85" y1="45" x2="145" y2="55" stroke="#00D9F5" strokeWidth="3" strokeLinecap="round" />
                {/* Upper arm */}
                <line x1="85" y1="45" x2="68" y2="78" stroke="#00F5A0" strokeWidth="3" strokeLinecap="round" />
                {/* Forearm */}
                <line x1="68" y1="78" x2="82" y2="98" stroke="#00F5A0" strokeWidth="3" strokeLinecap="round" />
                {/* Legs */}
                <line x1="145" y1="55" x2="195" y2="75" stroke="#00D9F5" strokeWidth="3" strokeLinecap="round" />
                <line x1="195" y1="75" x2="225" y2="98" stroke="#00D9F5" strokeWidth="3" strokeLinecap="round" />
                {/* Landmark Keypoints */}
                <circle cx="60" cy="38" r="6" fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="85" cy="45" r="3.5" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="68" cy="78" r="4.5" fill="#F59E0B" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="82" cy="98" r="3.5" fill="#00F5A0" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="145" cy="55" r="3.5" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="195" cy="75" r="3.5" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="225" cy="98" r="3.5" fill="#00D9F5" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Bottom HUD Row */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-300 relative z-10 border-t border-slate-800/80 pt-1">
              <span>90° Depth Inflection Verified</span>
              <span className="text-emerald-400 font-bold">REP COUNTED</span>
            </div>
          </div>

          {/* Entry Action Buttons: Login & Register - 12-16px gap */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1">
            <Button
              variant="glow"
              size="lg"
              onClick={onNavigateLogin || onStart}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full sm:w-auto min-w-[150px] shadow-xl bg-white text-blue-900 hover:bg-slate-100 dark:bg-brand-neon dark:text-slate-950 font-bold"
            >
              Login
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onNavigateRegister || onStart}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="w-full sm:w-auto min-w-[150px] shadow-sm font-bold bg-white/15 text-white hover:bg-white/25 border-white/20 dark:bg-surface-50 dark:hover:bg-slate-800 dark:text-white dark:border-white/10"
            >
              Register
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-1 text-[11px] sm:text-xs text-blue-100 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-300 dark:text-brand-neon" />
              <span>Zero Video Uploads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-300 dark:text-brand-neon" />
              <span>100% Free &amp; Browser-Based</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-300 dark:text-brand-neon" />
              <span>Strict Anti-False Reps</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
