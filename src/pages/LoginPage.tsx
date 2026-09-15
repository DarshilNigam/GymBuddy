import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { authService } from '../services/authService';

export interface LoginPageProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onGoHome: () => void;
}

export function LoginPage({ onSuccess, onNavigateRegister, onGoHome }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 relative overflow-hidden">
      {/* Background Soft Blue Ambient Lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-400/10 dark:bg-brand-neon/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-sky-400/10 dark:bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full relative z-10 space-y-6">
        {/* Back navigation button */}
        <div>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {/* 2-Column Split: Left Brand Showcase, Right Focused Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Brand & Trust Showcase */}
          <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-surface-100 dark:via-surface-100 dark:to-surface-50 p-6 sm:p-8 text-white flex flex-col justify-between shadow-xl border border-blue-400/30 dark:border-white/10 relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black font-display tracking-tight text-white">
                    GYM<span className="text-sky-300 dark:text-brand-neon">BUDDY</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-blue-200 dark:text-slate-400 -mt-0.5">
                    AI Training Gateway
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Badge variant="cyan" size="sm">Edge AI Verification</Badge>
                <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
                  Welcome to Your Intelligent Personal Trainer
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-300 leading-relaxed">
                  Authenticate to synchronize your workout history, track personal bests, and train with zero false-positive repetition verification.
                </p>
              </div>

              {/* Verified Features List */}
              <div className="space-y-2.5 pt-3 border-t border-white/15 dark:border-white/10">
                <div className="flex items-center gap-3 text-xs text-blue-100 dark:text-slate-300">
                  <div className="p-1 rounded-lg bg-white/15 text-emerald-300 dark:text-brand-neon">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>60 FPS Sub-Degree Angular Biomechanics</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-blue-100 dark:text-slate-300">
                  <div className="p-1 rounded-lg bg-white/15 text-emerald-300 dark:text-brand-neon">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Zero Fake Counting & Anti-Spike Rejection</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-blue-100 dark:text-slate-300">
                  <div className="p-1 rounded-lg bg-white/15 text-emerald-300 dark:text-brand-neon">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Private On-Device Video Processing</span>
                </div>
              </div>
            </div>

            {/* Bottom Guarantee */}
            <div className="pt-6 relative z-10 flex items-center gap-2 text-xs text-blue-200 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-300 dark:text-brand-neon shrink-0" />
              <span>Camera frames remain completely local in your browser.</span>
            </div>
          </div>

          {/* Right Column: Focused Login Card */}
          <div className="lg:col-span-6">
            <Card className="p-6 sm:p-8 space-y-6 shadow-light-card border-slate-200/90 dark:border-white/10 h-full flex flex-col justify-between">
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                    Athlete Sign In
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Enter your credentials to access the AI workout suite.
                  </p>
                </div>

                {/* General Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-500/30 flex items-start justify-between gap-2.5 text-xs text-rose-700 dark:text-rose-300"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                    {error.toLowerCase().includes('register') && (
                      <button
                        type="button"
                        onClick={onNavigateRegister}
                        className="font-bold underline text-brand-primary dark:text-brand-neon hover:opacity-80 shrink-0 cursor-pointer"
                      >
                        Register
                      </button>
                    )}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                        }}
                        placeholder="alex@gymbuddy.ai"
                        autoComplete="email"
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-surface-50 border text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                          fieldErrors.email
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500/50'
                            : 'border-slate-200 dark:border-white/10 focus:border-brand-primary focus:ring-blue-100 dark:focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pl-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                        }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-surface-50 border text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                          fieldErrors.password
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500/50'
                            : 'border-slate-200 dark:border-white/10 focus:border-brand-primary focus:ring-blue-100 dark:focus:ring-emerald-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pl-1">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="glow"
                      size="lg"
                      className="w-full shadow-light-blue"
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Sign In & Train
                    </Button>
                  </div>
                </form>
              </div>

              {/* Path to Register */}
              <div className="pt-4 text-center border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
                Don't have an athlete account?{' '}
                <button
                  onClick={onNavigateRegister}
                  className="font-bold text-brand-primary dark:text-brand-neon hover:underline cursor-pointer ml-1"
                >
                  Create one now
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
