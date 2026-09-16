import React from 'react';

export interface PushUpSkeletonVisualProps {
  stage?: 'lockout' | 'descent' | 'depth' | 'ascent' | 'card' | 'hero';
  className?: string;
  showFloor?: boolean;
  showAngleArc?: boolean;
  highlightJoint?: 'elbow' | 'shoulder' | 'spine' | 'none';
  accentColor?: string;
  secondaryColor?: string;
}

/**
 * Anatomically authentic computer-vision push-up skeleton visual.
 * Accurately models a realistic human side-profile during a push-up with
 * a rigid, non-sagging spine from head through shoulders, hips, knees, down to toes.
 */
export function PushUpSkeletonVisual({
  stage = 'lockout',
  className = 'w-full h-full max-h-[120px]',
  showFloor = true,
  showAngleArc = false,
  highlightJoint = 'elbow',
  accentColor = '#00F5A0', // Brand Neon Green
  secondaryColor = '#00D9F5', // Brand Cyan
}: PushUpSkeletonVisualProps) {
  // Coordinate sets for each phase
  const coordinates = {
    // 1. Top Lockout Plank Position (~180° elbow extension)
    lockout: {
      head: { x: 42, y: 25, r: 6.5 },
      neck: { x: 52, y: 30 },
      shoulder: { x: 62, y: 34 },
      elbow: { x: 63, y: 58 },
      wrist: { x: 64, y: 83 },
      palm: { x: 58, y: 84, x2: 70, y2: 84 },
      hip: { x: 130, y: 53 },
      knee: { x: 172, y: 65 },
      ankle: { x: 212, y: 76 },
      toe: { x: 218, y: 84 },
      elbowAngle: '178°',
    },
    // 2. Controlled Descent Phase (~135° elbow flexion)
    descent: {
      head: { x: 42, y: 40, r: 6.5 },
      neck: { x: 52, y: 45 },
      shoulder: { x: 63, y: 49 },
      elbow: { x: 76, y: 60 },
      wrist: { x: 64, y: 83 },
      palm: { x: 58, y: 84, x2: 70, y2: 84 },
      hip: { x: 130, y: 62 },
      knee: { x: 172, y: 70 },
      ankle: { x: 212, y: 78 },
      toe: { x: 218, y: 84 },
      elbowAngle: '135°',
    },
    // 3. Target Depth Inflection (90° elbow flexion, chest hovering over floor)
    depth: {
      head: { x: 42, y: 56, r: 6.5 },
      neck: { x: 52, y: 60 },
      shoulder: { x: 64, y: 64 },
      elbow: { x: 88, y: 62 },
      wrist: { x: 64, y: 83 },
      palm: { x: 58, y: 84, x2: 70, y2: 84 },
      hip: { x: 130, y: 70 },
      knee: { x: 172, y: 75 },
      ankle: { x: 212, y: 79 },
      toe: { x: 218, y: 84 },
      elbowAngle: '90°',
    },
    // 4. Ascent Drive Phase (~130° elbow extension)
    ascent: {
      head: { x: 42, y: 41, r: 6.5 },
      neck: { x: 52, y: 46 },
      shoulder: { x: 63, y: 50 },
      elbow: { x: 76, y: 61 },
      wrist: { x: 64, y: 83 },
      palm: { x: 58, y: 84, x2: 70, y2: 84 },
      hip: { x: 130, y: 63 },
      knee: { x: 172, y: 71 },
      ankle: { x: 212, y: 78 },
      toe: { x: 218, y: 84 },
      elbowAngle: '132°',
    },
    // 5. Card Preview (Compact Depth Showcase with Angle Measurement)
    card: {
      head: { x: 42, y: 55, r: 6.5 },
      neck: { x: 52, y: 59 },
      shoulder: { x: 64, y: 63 },
      elbow: { x: 88, y: 61 },
      wrist: { x: 64, y: 83 },
      palm: { x: 58, y: 84, x2: 70, y2: 84 },
      hip: { x: 130, y: 69 },
      knee: { x: 172, y: 74 },
      ankle: { x: 212, y: 78 },
      toe: { x: 218, y: 84 },
      elbowAngle: '90.4°',
    },
    // 6. Hero Telemetry (Live In-Depth Biomechanical Verification)
    hero: {
      head: { x: 42, y: 55, r: 6.5 },
      neck: { x: 52, y: 59 },
      shoulder: { x: 64, y: 63 },
      elbow: { x: 88, y: 61 },
      wrist: { x: 64, y: 83 },
      palm: { x: 58, y: 84, x2: 70, y2: 84 },
      hip: { x: 130, y: 69 },
      knee: { x: 172, y: 74 },
      ankle: { x: 212, y: 78 },
      toe: { x: 218, y: 84 },
      elbowAngle: '90.0°',
    },
  };

  const current = coordinates[stage] || coordinates.lockout;
  const isDepthOrHero = stage === 'depth' || stage === 'hero' || stage === 'card';

  return (
    <svg
      viewBox="0 0 240 95"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Bone Gradients */}
        <linearGradient id="torso-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
        <linearGradient id="arm-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
        <linearGradient id="leg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      {/* Ground Floor Alignment Line */}
      {showFloor && (
        <g opacity="0.45">
          <line
            x1="20"
            y1="85"
            x2="230"
            y2="85"
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Ground Contact Contact Pads */}
          <line
            x1={current.palm.x}
            y1="85"
            x2={current.palm.x2}
            y2="85"
            stroke={secondaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="214"
            y1="85"
            x2="222"
            y2="85"
            stroke={secondaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* 90° Angle Arc Indicator for Depth Verification */}
      {(showAngleArc || isDepthOrHero) && (
        <g opacity="0.85">
          <path
            d={`M ${current.elbow.x - 9} ${current.elbow.y} A 9 9 0 0 1 ${current.elbow.x} ${current.elbow.y + 9}`}
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            fill="rgba(245, 158, 11, 0.15)"
          />
        </g>
      )}

      {/* Skeletal Vector Bones */}
      <g strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Head-to-Neck Vector */}
        <line
          x1={current.head.x}
          y1={current.head.y}
          x2={current.neck.x}
          y2={current.neck.y}
          stroke={secondaryColor}
          opacity="0.8"
        />

        {/* Neck-to-Shoulder Vector */}
        <line
          x1={current.neck.x}
          y1={current.neck.y}
          x2={current.shoulder.x}
          y2={current.shoulder.y}
          stroke={secondaryColor}
        />

        {/* Torso / Spine: Shoulder -> Hip (Straight, non-sagging anatomical line) */}
        <line
          x1={current.shoulder.x}
          y1={current.shoulder.y}
          x2={current.hip.x}
          y2={current.hip.y}
          stroke="url(#torso-grad)"
          filter="url(#glow-cyan)"
        />

        {/* Arm Upper: Shoulder -> Elbow */}
        <line
          x1={current.shoulder.x}
          y1={current.shoulder.y}
          x2={current.elbow.x}
          y2={current.elbow.y}
          stroke="url(#arm-grad)"
        />

        {/* Forearm: Elbow -> Wrist */}
        <line
          x1={current.elbow.x}
          y1={current.elbow.y}
          x2={current.wrist.x}
          y2={current.wrist.y}
          stroke="url(#arm-grad)"
        />

        {/* Upper Leg: Hip -> Knee */}
        <line
          x1={current.hip.x}
          y1={current.hip.y}
          x2={current.knee.x}
          y2={current.knee.y}
          stroke="url(#leg-grad)"
        />

        {/* Lower Leg: Knee -> Ankle */}
        <line
          x1={current.knee.x}
          y1={current.knee.y}
          x2={current.ankle.x}
          y2={current.ankle.y}
          stroke="url(#leg-grad)"
        />

        {/* Foot / Toes: Ankle -> Toe */}
        <line
          x1={current.ankle.x}
          y1={current.ankle.y}
          x2={current.toe.x}
          y2={current.toe.y}
          stroke={secondaryColor}
          strokeWidth="3"
        />
      </g>

      {/* Biometric Joint Tracking Nodes */}
      <g>
        {/* Head Node */}
        <circle
          cx={current.head.x}
          cy={current.head.y}
          r={current.head.r}
          fill="#3B82F6"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Shoulder Joint */}
        <circle
          cx={current.shoulder.x}
          cy={current.shoulder.y}
          r="4.5"
          fill={secondaryColor}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Elbow Joint (Primary Kinematic Depth Node) */}
        {highlightJoint === 'elbow' && isDepthOrHero ? (
          <g>
            <circle
              cx={current.elbow.x}
              cy={current.elbow.y}
              r="7"
              fill="rgba(245, 158, 11, 0.3)"
              className="animate-pulse"
            />
            <circle
              cx={current.elbow.x}
              cy={current.elbow.y}
              r="5"
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </g>
        ) : (
          <circle
            cx={current.elbow.x}
            cy={current.elbow.y}
            r="4.5"
            fill={accentColor}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        )}

        {/* Wrist / Palm Ground Contact */}
        <circle
          cx={current.wrist.x}
          cy={current.wrist.y}
          r="4"
          fill={secondaryColor}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Hip Joint */}
        <circle
          cx={current.hip.x}
          cy={current.hip.y}
          r="4.5"
          fill={accentColor}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Knee Joint */}
        <circle
          cx={current.knee.x}
          cy={current.knee.y}
          r="4"
          fill={secondaryColor}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Ankle Joint */}
        <circle
          cx={current.ankle.x}
          cy={current.ankle.y}
          r="4"
          fill={secondaryColor}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Toe Ground Contact Point */}
        <circle
          cx={current.toe.x}
          cy={current.toe.y}
          r="3"
          fill={accentColor}
          stroke="#FFFFFF"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}
