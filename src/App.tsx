import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExerciseSelectionPage } from './pages/ExerciseSelectionPage';
import { CameraPermissionPage } from './pages/CameraPermissionPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { WorkoutResultsPage } from './pages/WorkoutResultsPage';
import { ProgressPage } from './pages/ProgressPage';

import { authService, AuthUser } from './services/authService';
import { storageService } from './services/storageService';
import { WorkoutService } from './services/workoutService';
import { ExerciseType, ExerciseConfig } from './types/exercise';
import { WorkoutSession } from './types/workout';
import { UserProfile, MonthlyStats } from './types/analytics';

type PageRoute =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'exercises'
  | 'camera-permission'
  | 'workout'
  | 'results'
  | 'progress';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('landing');
  const [selectedExerciseId, setSelectedExerciseId] = useState<ExerciseType>('pushups');
  const [completedSession, setCompletedSession] = useState<WorkoutSession | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // App persistent state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>(() => storageService.getMonthlyStats());

  // Reload state from storage
  const refreshStorageData = (user?: AuthUser | null) => {
    const activeUser = user !== undefined ? user : (currentUser || authService.getCurrentUser());
    setUserProfile(storageService.getUserProfile(activeUser));
    setMonthlyStats(storageService.getMonthlyStats(activeUser?.id));
  };

  useEffect(() => {
    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
      refreshStorageData(user);
      if (user?.id) {
        storageService.syncFromCloud(user.id).catch(() => {});
      }
    });

    const unsubStorage = storageService.subscribe(() => {
      refreshStorageData();
    });

    const initialUser = authService.getCurrentUser();
    if (initialUser?.id) {
      storageService.syncFromCloud(initialUser.id).catch(() => {});
    }

    return () => {
      unsubAuth();
      unsubStorage();
    };
  }, []);

  // Synchronize with browser history and popstate events
  useEffect(() => {
    // Initialize initial browser history state if absent
    if (!window.history.state || !window.history.state.page) {
      window.history.replaceState({ page: 'landing' }, '', '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.page) {
        const targetPage = state.page as PageRoute;

        if (state.selectedExerciseId) {
          setSelectedExerciseId(state.selectedExerciseId);
        }

        // Route Protection: Protected routes require authentication
        const protectedPages: PageRoute[] = [
          'exercises',
          'camera-permission',
          'workout',
          'results',
          'progress',
          'dashboard',
        ];

        if (protectedPages.includes(targetPage) && !authService.getCurrentUser()) {
          setCurrentPage('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        if (targetPage === 'dashboard' || targetPage === 'progress') {
          refreshStorageData();
          const user = authService.getCurrentUser();
          if (user?.id) {
            storageService.syncFromCloud(user.id).catch(() => {});
          }
        }

        setCurrentPage(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentPage('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectedExercise: ExerciseConfig = WorkoutService.getExerciseConfig(selectedExerciseId);

  // Global Navigation handler with history management & auth protection
  const handleNavigate = (page: string, options?: { replace?: boolean; exerciseId?: ExerciseType }) => {
    const targetPage = page as PageRoute;
    const exerciseId = options?.exerciseId || selectedExerciseId;
    const activeUser = currentUser || authService.getCurrentUser();

    if (targetPage === 'dashboard' || targetPage === 'progress') {
      refreshStorageData(activeUser);
      if (activeUser?.id) {
        storageService.syncFromCloud(activeUser.id).catch(() => {});
      }
    }

    // Route Protection: Protected routes require authentication
    const protectedPages: PageRoute[] = [
      'exercises',
      'camera-permission',
      'workout',
      'results',
      'progress',
      'dashboard',
    ];

    if (protectedPages.includes(targetPage) && !activeUser) {
      if (options?.replace) {
        window.history.replaceState({ page: 'login' }, '', '');
      } else {
        window.history.pushState({ page: 'login' }, '', '');
      }
      setCurrentPage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If authenticated user tries to open login/register, go to exercises
    if ((targetPage === 'login' || targetPage === 'register') && activeUser) {
      if (options?.replace) {
        window.history.replaceState({ page: 'exercises' }, '', '');
      } else {
        window.history.pushState({ page: 'exercises' }, '', '');
      }
      setCurrentPage('exercises');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const historyState = { page: targetPage, selectedExerciseId: exerciseId };
    if (options?.replace) {
      window.history.replaceState(historyState, '', '');
    } else {
      window.history.pushState(historyState, '', '');
    }

    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global Back Navigation handler: uses browser history as source of truth
  const handleBack = () => {
    const activeUser = currentUser || authService.getCurrentUser();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback only if no history entries exist
      handleNavigate(activeUser ? 'dashboard' : 'landing', { replace: true });
    }
  };

  // Primary Landing Page CTA handler
  const handleLandingStart = () => {
    const activeUser = currentUser || authService.getCurrentUser();
    if (activeUser) {
      handleNavigate('exercises');
    } else {
      handleNavigate('login');
    }
  };

  const handleAuthSuccess = () => {
    // Immediately open Choose Your AI Workout upon login/registration
    handleNavigate('exercises', { replace: true });
  };

  const handleLogout = () => {
    authService.logout();
    handleNavigate('landing', { replace: true });
  };

  const handleSelectExercise = (exerciseId: string) => {
    const exId = exerciseId as ExerciseType;
    setSelectedExerciseId(exId);
    handleNavigate('camera-permission', { exerciseId: exId });
  };

  const handlePermissionGranted = () => {
    handleNavigate('workout');
  };

  const handleFinishWorkout = (session: WorkoutSession) => {
    setCompletedSession(session);
    refreshStorageData();
    handleNavigate('results');
  };

  const handleSelectSessionFromList = (session: WorkoutSession) => {
    setCompletedSession(session);
    handleNavigate('results');
  };

  const handleRestartWorkout = (exerciseId: string) => {
    const exId = exerciseId as ExerciseType;
    setSelectedExerciseId(exId);
    handleNavigate('workout', { replace: true, exerciseId: exId });
  };

  const isWorkoutActive = currentPage === 'workout';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-background-dark dark:text-slate-100 font-sans selection:bg-brand-primary selection:text-white dark:selection:bg-brand-neon dark:selection:text-black transition-colors duration-200">
      {/* Hide Navbar during active live workout to maximize screen real-estate */}
      {!isWorkoutActive && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          streak={userProfile.currentStreak}
          userLevel={userProfile.level}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onStart={handleLandingStart}
            onNavigateLogin={() => handleNavigate('login')}
            onNavigateRegister={() => handleNavigate('register')}
            onNavigateDashboard={() => handleNavigate('dashboard')}
            isAuthenticated={Boolean(currentUser)}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigateRegister={() => handleNavigate('register')}
            onGoHome={handleBack}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onNavigateLogin={() => handleNavigate('login')}
            onGoHome={handleBack}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            user={userProfile}
            monthlyStats={monthlyStats}
            onSelectExercise={handleSelectExercise}
            onSelectSession={handleSelectSessionFromList}
            onViewProgress={() => handleNavigate('progress')}
            onBack={handleBack}
          />
        )}

        {currentPage === 'exercises' && (
          <ExerciseSelectionPage
            onSelectExercise={handleSelectExercise}
            onBack={handleBack}
          />
        )}

        {currentPage === 'camera-permission' && (
          <CameraPermissionPage
            exercise={selectedExercise}
            onPermissionGranted={handlePermissionGranted}
            onBack={handleBack}
          />
        )}

        {currentPage === 'workout' && (
          <WorkoutPage
            exercise={selectedExercise}
            onFinishWorkout={handleFinishWorkout}
            onExit={handleBack}
          />
        )}

        {currentPage === 'results' && completedSession && (
          <WorkoutResultsPage
            session={completedSession}
            onGoHome={() => handleNavigate('dashboard')}
            onRestart={handleRestartWorkout}
            onBack={handleBack}
          />
        )}

        {currentPage === 'progress' && (
          <ProgressPage
            user={userProfile}
            monthlyStats={monthlyStats}
            onSelectExercise={handleSelectExercise}
            onSelectSession={handleSelectSessionFromList}
            onBack={handleBack}
          />
        )}
      </main>

      {!isWorkoutActive && <Footer onNavigate={handleNavigate} currentUser={currentUser} />}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
