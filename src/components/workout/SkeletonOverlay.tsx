import React, { useRef, useEffect } from 'react';
import { Landmark, PoseLandmarkIndex } from '../../types/pose';

export interface SkeletonOverlayProps {
  landmarks: Landmark[];
  isMirrored?: boolean;
  exerciseId?: string;
  isPersonInFrame?: boolean;
  className?: string;
}

const POSE_CONNECTIONS: [PoseLandmarkIndex, PoseLandmarkIndex][] = [
  // Torso
  [PoseLandmarkIndex.LEFT_SHOULDER, PoseLandmarkIndex.RIGHT_SHOULDER],
  [PoseLandmarkIndex.LEFT_SHOULDER, PoseLandmarkIndex.LEFT_HIP],
  [PoseLandmarkIndex.RIGHT_SHOULDER, PoseLandmarkIndex.RIGHT_HIP],
  [PoseLandmarkIndex.LEFT_HIP, PoseLandmarkIndex.RIGHT_HIP],
  // Left Arm
  [PoseLandmarkIndex.LEFT_SHOULDER, PoseLandmarkIndex.LEFT_ELBOW],
  [PoseLandmarkIndex.LEFT_ELBOW, PoseLandmarkIndex.LEFT_WRIST],
  // Right Arm
  [PoseLandmarkIndex.RIGHT_SHOULDER, PoseLandmarkIndex.RIGHT_ELBOW],
  [PoseLandmarkIndex.RIGHT_ELBOW, PoseLandmarkIndex.RIGHT_WRIST],
  // Left Leg
  [PoseLandmarkIndex.LEFT_HIP, PoseLandmarkIndex.LEFT_KNEE],
  [PoseLandmarkIndex.LEFT_KNEE, PoseLandmarkIndex.LEFT_ANKLE],
  // Right Leg
  [PoseLandmarkIndex.RIGHT_HIP, PoseLandmarkIndex.RIGHT_KNEE],
  [PoseLandmarkIndex.RIGHT_KNEE, PoseLandmarkIndex.RIGHT_ANKLE],
];

export function SkeletonOverlay({
  landmarks,
  isMirrored = false,
  exerciseId = 'pushups',
  isPersonInFrame = true,
  className = '',
}: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.round(width * dpr);
    const displayHeight = Math.round(height * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (!isPersonInFrame || !landmarks || landmarks.length < 33) {
      return;
    }

    const getCoord = (lm: Landmark) => {
      const x = isMirrored ? (1 - lm.x) * width : lm.x * width;
      const y = lm.y * height;
      const vis = lm.visibility ?? 1.0;
      return { x, y, vis };
    };

    // Determine highlighted joints based on exercise
    const isPushup = exerciseId === 'pushups';
    const primaryJoints = isPushup
      ? [
          PoseLandmarkIndex.LEFT_SHOULDER,
          PoseLandmarkIndex.RIGHT_SHOULDER,
          PoseLandmarkIndex.LEFT_ELBOW,
          PoseLandmarkIndex.RIGHT_ELBOW,
          PoseLandmarkIndex.LEFT_WRIST,
          PoseLandmarkIndex.RIGHT_WRIST,
          PoseLandmarkIndex.LEFT_HIP,
          PoseLandmarkIndex.RIGHT_HIP,
        ]
      : [
          PoseLandmarkIndex.LEFT_SHOULDER,
          PoseLandmarkIndex.RIGHT_SHOULDER,
          PoseLandmarkIndex.LEFT_HIP,
          PoseLandmarkIndex.RIGHT_HIP,
          PoseLandmarkIndex.LEFT_KNEE,
          PoseLandmarkIndex.RIGHT_KNEE,
          PoseLandmarkIndex.LEFT_ANKLE,
          PoseLandmarkIndex.RIGHT_ANKLE,
        ];

    // 1. Draw connection lines
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (!start || !end) continue;

      const p1 = getCoord(start);
      const p2 = getCoord(end);

      if (p1.vis < 0.25 || p2.vis < 0.25) continue;

      const avgVis = (p1.vis + p2.vis) / 2;

      // Create gradient line
      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, `rgba(0, 229, 255, ${Math.min(0.9, avgVis)})`);
      grad.addColorStop(1, `rgba(0, 255, 136, ${Math.min(0.9, avgVis)})`);

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Draw joint landmark points
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      if (!lm) continue;

      const { x, y, vis } = getCoord(lm);
      if (vis < 0.25) continue;

      const isPrimary = primaryJoints.includes(i);
      const radius = isPrimary ? 6 : 3.5;

      // Outer glow circle for key joints
      if (isPrimary) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(0, 255, 136, ${Math.min(0.35, vis * 0.4)})`;
        ctx.fill();
      }

      // Core joint circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isPrimary ? '#00FF88' : '#00E5FF';
      ctx.strokeStyle = '#0B0F19';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    }
  }, [landmarks, isMirrored, exerciseId, isPersonInFrame]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full z-[5] ${className}`}
    />
  );
}
