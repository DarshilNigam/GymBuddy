import React, { useState } from 'react';
import {
  Camera,
  ShieldCheck,
  Eye,
  Lock,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Video,
  Sparkles,
  Maximize2,
  Info,
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ExerciseConfig } from '../types/exercise';

export interface CameraPermissionPageProps {
  exercise: ExerciseConfig;
  onPermissionGranted: () => void;
  onBack: () => void;
}

export function CameraPermissionPage({
  exercise,
  onPermissionGranted,
  onBack,
}: CameraPermissionPageProps) {
  const {
    videoRef,
    isStreaming,
    permissionStatus,
    errorMessage,
    startCamera,
    stopCamera,
    availableDevices,
    switchCamera,
    activeDeviceId,
  } = useCamera({ autoStart: false });

  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await startCamera();
    } catch (e) {
      console.error('Failed to request camera permission:', e);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleStartWorkout = () => {
    stopCamera();
    onPermissionGranted();
  };

  const isPushup = exercise.id === 'pushups';

  const hasError = permissionStatus === 'denied' || permissionStatus === 'error' || permissionStatus === 'unsupported' || Boolean(errorMessage);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-4 sm:pb-5 space-y-2.5 sm:space-y-3.5">
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={() => {
            stopCamera();
            onBack();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-0.5 sm:space-y-1">
        <Badge variant="cyan" size="sm">CAMERA SETUP</Badge>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
          Let's get you in position.
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
          Your camera helps GymBuddy track body movement and verify each repetition in real time.
        </p>
      </div>

      {/* Main Setup Card */}
      <Card className="p-3.5 sm:p-4 lg:p-5 border-slate-200/90 dark:border-white/10 bg-white dark:bg-surface-100/90 shadow-light-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
          {/* Left Column: Camera Preview or Framing Guide Box */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[16/11] sm:aspect-[4/3] max-h-[260px] sm:max-h-[300px] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center">
              {/* HTML Video stream */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
              />

              {/* Placeholder when Camera is Not Yet Active */}
              {!isStreaming ? (
                <div className="p-4 sm:p-5 text-center space-y-3 sm:space-y-4 max-w-xs">
                  {/* Framing Guide Diagram */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                    {/* Framing corners */}
                    <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-blue-500 dark:border-brand-neon" />
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-blue-500 dark:border-brand-neon" />
                    <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-blue-500 dark:border-brand-neon" />
                    <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-blue-500 dark:border-brand-neon" />

                    {/* Stylized Silhouette */}
                    <div className="flex flex-col items-center opacity-80">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/20 border border-blue-400/40" />
                      <div className="w-8 h-7 sm:w-10 sm:h-8 rounded-t-lg bg-blue-500/20 border-t border-x border-blue-400/40 mt-1" />
                    </div>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white">Camera Standby</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Position your device 6–8 feet away at chest or waist height for a side profile view.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Overlay Corners when Streaming */}
                  <div className="absolute inset-0 pointer-events-none p-3 sm:p-4 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <Badge variant="neon" size="sm" dot>Camera Ready</Badge>
                      <Badge variant="slate" size="sm">{exercise.name}</Badge>
                    </div>

                    <div className="self-center border border-dashed border-white/30 rounded-xl px-3 py-1 backdrop-blur-md bg-slate-950/60 text-[10px] sm:text-[11px] font-mono text-slate-300">
                      Side Profile Framing Zone
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Device Switcher (if streaming and multiple cameras available) */}
            {isStreaming && availableDevices.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Camera Source:</span>
                <select
                  value={activeDeviceId || ''}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="bg-slate-100 dark:bg-surface-50 border border-slate-200 dark:border-white/10 rounded-lg text-[11px] py-1 px-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  {availableDevices.map((dev) => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label || `Camera (${dev.deviceId.slice(0, 5)}...)`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Column: Positioning Checklist & Controls */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-3.5">
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                Positioning Checklist
              </h3>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-blue-50 text-brand-primary dark:bg-blue-500/10 dark:text-brand-cyan shrink-0 mt-0.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Distance & Elevation
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Place your camera 6–8 feet away at chest/waist height with your full body in view.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-brand-neon shrink-0 mt-0.5">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Side-Angle Orientation
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      {isPushup
                        ? 'Align horizontally to camera for clear shoulder, elbow, and hip tracking.'
                        : 'Lie down sideways to the camera so your torso and knees are visible.'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-surface-50 border border-slate-200/80 dark:border-white/5 flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Clear Ambient Lighting
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Ensure your room is well-lit and avoid standing directly in front of bright backlights.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Notification if Permission Denied or Failed */}
            {hasError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-xs">
                    {permissionStatus === 'denied'
                      ? 'Camera access was blocked'
                      : permissionStatus === 'unsupported'
                      ? 'Camera unsupported'
                      : 'Camera access error'}
                  </span>
                  <p className="text-[10px] leading-normal">
                    {errorMessage || 'Please check your browser permissions to allow camera access for GymBuddy.'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1 sm:pt-1.5">
              {!isStreaming ? (
                <Button
                  variant="glow"
                  size="lg"
                  onClick={handleRequestPermission}
                  isLoading={isRequesting}
                  leftIcon={<Camera className="w-4 h-4" />}
                  className="w-full shadow-light-blue cursor-pointer"
                >
                  {hasError ? 'Try Camera Again' : 'Enable Camera'}
                </Button>
              ) : (
                <Button
                  variant="glow"
                  size="lg"
                  onClick={handleStartWorkout}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full shadow-light-blue cursor-pointer"
                >
                  Start Workout →
                </Button>
              )}

              {/* Privacy Reassurance */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-neon shrink-0" />
                <span>Your workout video is processed locally on this device.</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
