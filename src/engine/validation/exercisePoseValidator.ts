import { Landmark, PoseLandmarkIndex } from '../../types/pose';
import { calculateAngle } from '../geometry/calculateAngle';

export interface PoseValidationGateResult {
  valid: boolean;
  gates: {
    bodyOrientation: boolean;
    bodyAlignment: boolean;
    armGeometry?: boolean;
    hipGeometry?: boolean;
    kneeGeometry?: boolean;
    lowerBodyVisible: boolean;
    confidenceValid: boolean;
  };
  failureReasons: string[];
  activeSide: 'left' | 'right';
  confidence: number;
}

/**
 * Validates whether the subject is in a genuine horizontal plank / push-up position from a side perspective.
 *
 * Rejects:
 * 1. Standing upright poses (vertical spine/legs)
 * 2. Walking / standing while bending over (hip hinges where legs are vertical)
 * 3. Squatting or seated poses
 * 4. Pikes (hips pitched high in the air) and severe sags (hyperextended lumbar spine)
 * 5. Occluded or missing lower extremities (need ankle/hip for valid plank detection)
 */
export function validatePushupPose(
  landmarks: Landmark[],
  minConfidence: number = 0.4
): PoseValidationGateResult {
  const failureReasons: string[] = [];

  if (!landmarks || landmarks.length < 33) {
    return {
      valid: false,
      gates: {
        bodyOrientation: false,
        bodyAlignment: false,
        armGeometry: false,
        hipGeometry: false,
        lowerBodyVisible: false,
        confidenceValid: false,
      },
      failureReasons: ['Step back so your full body is in the camera frame.'],
      activeSide: 'left',
      confidence: 0,
    };
  }

  // 1. Determine dominant side (left vs right profile)
  const leftVis =
    ((landmarks[PoseLandmarkIndex.LEFT_SHOULDER]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_ELBOW]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_WRIST]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_HIP]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_ANKLE]?.visibility ?? 0)) / 5;

  const rightVis =
    ((landmarks[PoseLandmarkIndex.RIGHT_SHOULDER]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_ELBOW]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_WRIST]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_HIP]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_ANKLE]?.visibility ?? 0)) / 5;

  const activeSide: 'left' | 'right' = leftVis >= rightVis ? 'left' : 'right';
  const dominantConfidence = Math.max(leftVis, rightVis);

  const shoulderIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_SHOULDER : PoseLandmarkIndex.RIGHT_SHOULDER;
  const elbowIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_ELBOW : PoseLandmarkIndex.RIGHT_ELBOW;
  const wristIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_WRIST : PoseLandmarkIndex.RIGHT_WRIST;
  const hipIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_HIP : PoseLandmarkIndex.RIGHT_HIP;
  const ankleIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_ANKLE : PoseLandmarkIndex.RIGHT_ANKLE;

  const shoulder = landmarks[shoulderIdx];
  const elbow = landmarks[elbowIdx];
  const wrist = landmarks[wristIdx];
  const hip = landmarks[hipIdx];
  const ankle = landmarks[ankleIdx];

  // Gate 1: Confidence check
  const keyJoints = [shoulder, elbow, wrist, hip, ankle];
  const allKeyJointsPresent = keyJoints.every((lm) => lm && (lm.visibility ?? 1.0) >= minConfidence);
  const confidenceValid = allKeyJointsPresent && dominantConfidence >= minConfidence;
  if (!confidenceValid) {
    failureReasons.push('Improve lighting or position your full body in the camera frame.');
  }

  // Gate 2: Lower body visibility
  const lowerBodyVisible = Boolean(
    hip && ankle && (hip.visibility ?? 1.0) >= minConfidence && (ankle.visibility ?? 1.0) >= minConfidence
  );
  if (!lowerBodyVisible) {
    failureReasons.push('Ensure your hips and feet are visible.');
  }

  // Gate 3: Body orientation (Horizontal plank vs Standing/Vertical)
  let bodyOrientation = false;
  if (shoulder && ankle) {
    const deltaX = Math.abs(shoulder.x - ankle.x);
    const deltaY = Math.abs(shoulder.y - ankle.y);

    const isHorizontalDominant = deltaX >= deltaY * 0.95;
    const angleWithHorizontal = (Math.atan2(deltaY, Math.max(0.001, deltaX)) * 180) / Math.PI;
    const isWithinPlankSlope = angleWithHorizontal <= 45;

    bodyOrientation = isHorizontalDominant && isWithinPlankSlope;
    if (!bodyOrientation) {
      failureReasons.push('Assume a horizontal plank position facing sideways to the camera.');
    }
  }

  // Gate 4: Body Alignment (Straight spine/plank line)
  let bodyAlignment = false;
  if (shoulder && hip && ankle) {
    const spineAngle = calculateAngle(shoulder, hip, ankle);
    bodyAlignment = spineAngle >= 142 && spineAngle <= 180;
    if (!bodyAlignment) {
      if (spineAngle < 142) {
        failureReasons.push('Keep your core braced in a straight line; avoid sagging or piking hips.');
      }
    }
  }

  // Gate 5: Arm geometry & Hand placement
  let armGeometry = false;
  if (shoulder && elbow && wrist) {
    const wristBelowShoulder = wrist.y >= shoulder.y - 0.08;
    const elbowPlausible = elbow.y >= shoulder.y - 0.15;
    armGeometry = wristBelowShoulder && elbowPlausible;
    if (!armGeometry) {
      failureReasons.push('Place your hands flat on the floor under your shoulders.');
    }
  }

  // Gate 6: Hip geometry
  let hipGeometry = false;
  if (shoulder && hip && ankle) {
    const minY = Math.min(shoulder.y, ankle.y) - 0.2;
    const maxY = Math.max(shoulder.y, ankle.y) + 0.2;
    hipGeometry = hip.y >= minY && hip.y <= maxY;
    if (!hipGeometry) {
      failureReasons.push('Maintain hip level with shoulders and feet.');
    }
  }

  const allGatesPass =
    confidenceValid &&
    lowerBodyVisible &&
    bodyOrientation &&
    bodyAlignment &&
    armGeometry &&
    hipGeometry;

  return {
    valid: allGatesPass,
    gates: {
      bodyOrientation,
      bodyAlignment,
      armGeometry,
      hipGeometry,
      lowerBodyVisible,
      confidenceValid,
    },
    failureReasons,
    activeSide,
    confidence: dominantConfidence,
  };
}

/**
 * Validates whether the subject is in a valid grounded posture for sit-ups.
 *
 * Robust Design Principles:
 * 1. Primary joint chain: Shoulder → Hip → Knee.
 * 2. Side-adaptive: selects the best visible profile (left or right).
 * 3. Tolerant of momentary landmark occlusion on secondary joints (e.g. ankles).
 * 4. Strictly rejects standing/walking leg chains (vertical legs with extended knees).
 */
export function validateSitupPose(
  landmarks: Landmark[],
  minConfidence: number = 0.25,
  requireLyingStart: boolean = false
): PoseValidationGateResult {
  const failureReasons: string[] = [];

  if (!landmarks || landmarks.length < 33) {
    return {
      valid: false,
      gates: {
        bodyOrientation: false,
        bodyAlignment: false,
        kneeGeometry: false,
        lowerBodyVisible: false,
        confidenceValid: false,
      },
      failureReasons: ['Step back so your body is in the camera frame.'],
      activeSide: 'left',
      confidence: 0,
    };
  }

  // 1. Determine dominant side (left vs right profile) based on core torso chain: Shoulder, Hip, Knee
  const leftVis =
    ((landmarks[PoseLandmarkIndex.LEFT_SHOULDER]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_HIP]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_KNEE]?.visibility ?? 0)) / 3;

  const rightVis =
    ((landmarks[PoseLandmarkIndex.RIGHT_SHOULDER]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_HIP]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_KNEE]?.visibility ?? 0)) / 3;

  const activeSide: 'left' | 'right' = leftVis >= rightVis ? 'left' : 'right';
  const dominantConfidence = Math.max(leftVis, rightVis);

  const shoulderIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_SHOULDER : PoseLandmarkIndex.RIGHT_SHOULDER;
  const hipIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_HIP : PoseLandmarkIndex.RIGHT_HIP;
  const kneeIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_KNEE : PoseLandmarkIndex.RIGHT_KNEE;
  const ankleIdx = activeSide === 'left' ? PoseLandmarkIndex.LEFT_ANKLE : PoseLandmarkIndex.RIGHT_ANKLE;

  const shoulder = landmarks[shoulderIdx];
  const hip = landmarks[hipIdx];
  const knee = landmarks[kneeIdx];
  const ankle = landmarks[ankleIdx];

  // Gate 1: Primary Torso Confidence (Shoulder, Hip, Knee)
  const primaryJoints = [shoulder, hip, knee];
  const confidenceValid = primaryJoints.every((lm) => lm && (lm.visibility ?? 1.0) >= minConfidence);
  if (!confidenceValid) {
    failureReasons.push('Position yourself in clear view of the camera.');
  }

  // Gate 2: Lower Body Anchor (Hip and Knee visible)
  const lowerBodyVisible = Boolean(
    hip && knee &&
    (hip.visibility ?? 1.0) >= minConfidence &&
    (knee.visibility ?? 1.0) >= minConfidence
  );
  if (!lowerBodyVisible) {
    failureReasons.push('Ensure your hips and knees are visible.');
  }

  // Gate 3: Grounded Posture (Reject standing/walking)
  // In standing: hip is high above ankle (ankle.y - hip.y > 0.38) AND knee is straight / below hip.
  let bodyOrientation = true;
  if (hip && ankle && knee) {
    const isStandingLegChain =
      (ankle.visibility ?? 0) > 0.3 &&
      (ankle.y - hip.y > 0.38) &&
      (knee.y > hip.y + 0.12);

    if (isStandingLegChain) {
      bodyOrientation = false;
      failureReasons.push('Position yourself on the floor in side view.');
    }
  }

  // Gate 4: Knee bend check (diagnostic/guidance)
  let kneeGeometry = true;
  if (hip && knee && ankle && (ankle.visibility ?? 0) > 0.25) {
    const kneeAngle = calculateAngle(hip, knee, ankle);
    // Standard sit-ups require bent knees (roughly between 45° and 155°)
    kneeGeometry = kneeAngle >= 45 && kneeAngle <= 155;
    if (!kneeGeometry) {
      if (kneeAngle > 155) {
        failureReasons.push('Bend your knees at ~90° with feet on the floor.');
      }
    }
  }

  // Gate 5: Starting flat posture (only when acquiring start position)
  let bodyAlignment = true;
  if (requireLyingStart && shoulder && hip && knee) {
    const torsoAngle = calculateAngle(shoulder, hip, knee);
    const isFlatOnMat = torsoAngle >= 120 || (shoulder.y >= hip.y - 0.15);
    bodyAlignment = isFlatOnMat;
    if (!bodyAlignment) {
      failureReasons.push('Lie flat on your back to arm the repetition counter.');
    }
  }

  const allGatesPass = confidenceValid && lowerBodyVisible && bodyOrientation && kneeGeometry && bodyAlignment;

  return {
    valid: allGatesPass,
    gates: {
      bodyOrientation,
      bodyAlignment,
      kneeGeometry,
      lowerBodyVisible,
      confidenceValid,
    },
    failureReasons,
    activeSide,
    confidence: dominantConfidence,
  };
}
