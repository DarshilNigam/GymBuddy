import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { authService } from '../services/authService';

export interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onGoHome: () => void;
}

export function RegisterPage({ onSuccess, onNavigateLogin, onGoHome }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }

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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmationNotice(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await authService.register(name, email, password);
      if (result.requiresEmailConfirmation) {
        setConfirmationNotice('Account created. Please confirm your email, then log in.');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-6 sm:pb-8 space-y-4 sm:space-y-5 relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-400/10 dark:bg-brand-neon/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-sky-400/10 dark:bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full relative z-10 space-y-4 sm:space-y-5">
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

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-stretch">
          {/* Left Column: Athlete Onboarding Story */}
          <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-surface-100 dark:via-surface-100 dark:to-surface-50 p-5 sm:p-6 lg:p-7 text-white flex flex-col justify-between shadow-xl border border-blue-400/30 dark:border-white/10 relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 sm:space-y-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black font-display tracking-tight text-white">
                    GYM<span className="text-sky-300 dark:text-brand-neon">BUDDY</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-blue-200 dark:text-slate-400 -mt-0.5">
                    Athlete Onboarding
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Badge variant="cyan" size="sm">Precision AI Ecosystem</Badge>
                <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-snug">
                  Create Your Athletic AI Profile
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 dark:text-slate-300 leading-relaxed">
                  Join athletes tracking genuine biomechanical form progress, personal bests, and daily streaks with edge computer vision.
                </p>
              </div>

              {/* Verified Features List */}
              <div className="space-y-2 pt-2.5 border-t border-white/15 dark:border-white/10">
                <div className="flex items-center gap-3 text-xs text-blue-100 dark:text-slate-300">
                  <div className="p-1 rounded-lg bg-white/15 text-emerald-300 dark:text-brand-neon">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Real-Time Joint Angle Kinematics</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-blue-100 dark:text-slate-300">
                  <div className="p-1 rounded-lg bg-white/15 text-emerald-300 dark:text-brand-neon">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Lifetime Workout Analytics & Streak Milestones</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-blue-100 dark:text-slate-300">
                  <div className="p-1 rounded-lg bg-white/15 text-emerald-300 dark:text-brand-neon">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Zero Video Storage — 100% Private</span>
                </div>
              </div>
            </div>

            {/* Bottom Guarantee */}
            <div className="pt-4 relative z-10 flex items-center gap-2 text-xs text-blue-200 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-300 dark:text-brand-neon shrink-0" />
              <span>No credit card required. Free & browser-based.</span>
            </div>
          </div>

          {/* Right Column: Focused Register Card */}
          <div className="lg:col-span-6">
            <Card className="p-5 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 shadow-light-card border-slate-200/90 dark:border-white/10 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                    Create Account
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Set up your athlete credentials in 10 seconds.
                  </p>
                </div>

                {/* Email Confirmation Notice Banner */}
                {confirmationNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-500/30 flex items-start justify-between gap-2.5 text-xs text-emerald-800 dark:text-emerald-300"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{confirmationNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={onNavigateLogin}
                      className="font-bold underline text-brand-primary dark:text-brand-neon hover:opacity-80 shrink-0 cursor-pointer ml-1"
                    >
                      Log In
                    </button>
                  </motion.div>
                )}

                {/* General Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-500/30 flex items-start justify-between gap-2.5 text-xs text-rose-700 dark:text-rose-300"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                    {(error.toLowerCase().includes('log in') || error.toLowerCase().includes('registered')) && (
                      <button
                        type="button"
                        onClick={onNavigateLogin}
                        className="font-bold underline text-brand-primary dark:text-brand-neon hover:opacity-80 shrink-0 cursor-pointer"
                      >
                        Log In
                      </button>
                    )}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3" noValidate>
                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                        }}
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-2xl bg-slate-50 dark:bg-surface-50 border text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                          fieldErrors.name
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500/50'
                            : 'border-slate-200 dark:border-white/10 focus:border-brand-primary focus:ring-blue-100 dark:focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pl-1">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
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
                        className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-2xl bg-slate-50 dark:bg-surface-50 border text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
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
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Password (min. 6 characters)
                    </label>
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
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-11 py-2 sm:py-2.5 rounded-2xl bg-slate-50 dark:bg-surface-50 border text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
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

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword)
                            setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                        }}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-2xl bg-slate-50 dark:bg-surface-50 border text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                          fieldErrors.confirmPassword
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500/50'
                            : 'border-slate-200 dark:border-white/10 focus:border-brand-primary focus:ring-blue-100 dark:focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pl-1">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1.5">
                    <Button
                      type="submit"
                      variant="glow"
                      size="lg"
                      className="w-full shadow-light-blue"
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Create Athlete Account
                    </Button>
                  </div>
                </form>
              </div>

              {/* Path to Login */}
              <div className="pt-3 text-center border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
                Already have an athlete account?{' '}
                <button
                  onClick={onNavigateLogin}
                  className="font-bold text-brand-primary dark:text-brand-neon hover:underline cursor-pointer ml-1"
                >
                  Sign in here
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
