import React from 'react';
import { Activity, ShieldCheck, Sparkles, Cpu, ArrowUp, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';

import { AuthUser } from '../../services/authService';

export interface FooterProps {
  onNavigate?: (page: string) => void;
  currentUser?: AuthUser | null;
}

export function Footer({ onNavigate, currentUser }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-200/90 bg-white/95 dark:border-white/8 dark:bg-background-dark/90 backdrop-blur-2xl mt-16 sm:mt-20 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 space-y-10">
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Vision Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate && onNavigate(currentUser ? 'dashboard' : 'landing')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate && onNavigate(currentUser ? 'dashboard' : 'landing');
                }
              }}
              aria-label="GymBuddy Home"
              className="flex items-center gap-3 cursor-pointer group w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
            >
              <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-brand-primary dark:bg-surface-100 dark:border-brand-neon/40 dark:text-brand-neon shadow-sm group-hover:scale-105 transition-all">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                  GYM<span className="text-brand-primary dark:text-brand-neon">BUDDY</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 -mt-0.5">
                  Intelligent Training System
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Empowering athletes with next-generation edge computer vision. We measure real human biomechanics to validate every repetition without hardware sensors.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="cyan" size="sm" dot>Local Edge Vision</Badge>
              <Badge variant="neon" size="sm">60 FPS Ready</Badge>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('exercises')}
                  className="hover:text-brand-primary dark:hover:text-brand-neon transition-colors"
                >
                  Movement Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('dashboard')}
                  className="hover:text-brand-primary dark:hover:text-brand-neon transition-colors"
                >
                  Athlete Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('progress')}
                  className="hover:text-brand-primary dark:hover:text-brand-neon transition-colors"
                >
                  Performance Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('login')}
                  className="hover:text-brand-primary dark:hover:text-brand-neon transition-colors"
                >
                  Athlete Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Sports Science Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-900 dark:text-slate-200">
              Kinematics
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-default">
                  Push-up 90° Elbow Depth
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-default">
                  Sit-up 65° Torso Flexion
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-default">
                  Anti-Spike Filtering
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-default">
                  Temporal Grace Recovery
                </span>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-900 dark:text-slate-200">
              Security & Privacy
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-neon" />
                <span>Zero Video Uploads</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                All landmark processing happens strictly inside your browser via local WebAssembly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} GymBuddy AI. All rights reserved.</span>
            <span>•</span>
            <span>Precision Vision Standards</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-surface-50 dark:hover:bg-slate-800 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-white/5"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
