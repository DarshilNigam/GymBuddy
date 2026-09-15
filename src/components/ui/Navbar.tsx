import React, { useState } from 'react';
import {
  Activity,
  Flame,
  LayoutDashboard,
  Dumbbell,
  BarChart3,
  Menu,
  X,
  Play,
  Sun,
  Moon,
  LogOut,
  User,
  LogIn,
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useTheme } from '../../context/ThemeContext';
import { authService, AuthUser } from '../../services/authService';

export interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  streak?: number;
  userLevel?: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  streak = 7,
  userLevel = 8,
  currentUser = null,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'progress', label: 'Progress & Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 dark:border-white/8 dark:bg-background-dark/80 backdrop-blur-xl transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate(currentUser ? 'dashboard' : 'landing');
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="GymBuddy Home"
            className="flex items-center gap-3 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 dark:bg-gradient-to-br dark:from-surface-50 dark:to-surface-100 dark:border-brand-neon/40 dark:shadow-glow-neon group-hover:scale-105 transition-all">
              <Activity className="w-6 h-6 text-brand-primary dark:text-brand-neon animate-pulse-subtle" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 dark:bg-brand-neon opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary dark:bg-brand-neon"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight font-display text-slate-900 dark:text-white">
                  GYM<span className="text-brand-primary dark:text-brand-neon">BUDDY</span>
                </span>
                <Badge variant="cyan" size="sm">AI</Badge>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 -mt-1">
                Precision Vision
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-surface-100/60 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-brand-primary shadow-sm dark:bg-slate-800/90 dark:text-brand-neon dark:border dark:border-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-primary dark:text-brand-neon' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700 dark:border-white/10 dark:bg-surface-50 dark:hover:bg-slate-800 dark:text-slate-200 transition-colors shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </button>

            {currentUser ? (
              <>
                {/* Streak indicator */}
                <div
                  onClick={() => onNavigate('progress')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 dark:bg-amber-500/10 dark:border-amber-500/25 cursor-pointer hover:bg-orange-100/80 dark:hover:bg-amber-500/15 transition-all"
                  title="Daily workout streak"
                >
                  <Flame className="w-4 h-4 text-orange-500 dark:text-amber-400 animate-bounce" />
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-black text-orange-600 dark:text-amber-400 font-display">{streak} DAYS</span>
                    <span className="text-[9px] uppercase font-medium text-orange-500/80 dark:text-amber-300/70">Streak</span>
                  </div>
                </div>

                {/* Level Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/25">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 font-mono">LVL {userLevel}</span>
                </div>

                {/* Workout CTA */}
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => onNavigate('exercises')}
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
                >
                  Start Workout
                </Button>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:border-white/10 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('login')}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Sign In
                </Button>
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => onNavigate('register')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-surface-50 dark:text-slate-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 dark:bg-surface-50 dark:border-white/10 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                    isActive
                      ? 'bg-blue-50 text-brand-primary dark:bg-slate-800 dark:text-brand-neon'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {currentUser ? (
              <>
                <Button
                  variant="glow"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    onNavigate('exercises');
                    setMobileMenuOpen(false);
                  }}
                  leftIcon={<Play className="w-5 h-5 fill-current" />}
                >
                  Start Workout Now
                </Button>
                {onLogout && (
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Sign Out ({currentUser.name})
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="glow"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                >
                  Create Athlete Account
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
