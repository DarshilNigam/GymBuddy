import { Landmark, PoseLandmarkIndex } from '../../types/pose';

export interface LandmarkValidationResult {
  isValid: boolean;
  activeSide: 'left' | 'right' | 'front';
  confidence: number;
  missingLandmarks: string[];
}

export interface JointGroup {
  left: PoseLandmarkIndex;
  right: PoseLandmarkIndex;
  name: string;
}

export const PUSHUP_KEY_JOINTS: JointGroup[] = [
  { left: PoseLandmarkIndex.LEFT_SHOULDER, right: PoseLandmarkIndex.RIGHT_SHOULDER, name: 'Shoulder' },
  { left: PoseLandmarkIndex.LEFT_ELBOW, right: PoseLandmarkIndex.RIGHT_ELBOW, name: 'Elbow' },
  { left: PoseLandmarkIndex.LEFT_WRIST, right: PoseLandmarkIndex.RIGHT_WRIST, name: 'Wrist' },
  { left: PoseLandmarkIndex.LEFT_HIP, right: PoseLandmarkIndex.RIGHT_HIP, name: 'Hip' },
  { left: PoseLandmarkIndex.LEFT_ANKLE, right: PoseLandmarkIndex.RIGHT_ANKLE, name: 'Ankle' },
];

export const SITUP_KEY_JOINTS: JointGroup[] = [
  { left: PoseLandmarkIndex.LEFT_SHOULDER, right: PoseLandmarkIndex.RIGHT_SHOULDER, name: 'Shoulder' },
  { left: PoseLandmarkIndex.LEFT_HIP, right: PoseLandmarkIndex.RIGHT_HIP, name: 'Hip' },
  { left: PoseLandmarkIndex.LEFT_KNEE, right: PoseLandmarkIndex.RIGHT_KNEE, name: 'Knee' },
  { left: PoseLandmarkIndex.LEFT_ANKLE, right: PoseLandmarkIndex.RIGHT_ANKLE, name: 'Ankle' },
];

/**
 * Validates whether the required joints for an exercise are visible on at least one dominant body side (left or right).
 */
export function validateSideAdaptiveLandmarks(
  landmarks: Landmark[],
  jointGroups: JointGroup[],
  minConfidence: number = 0.4
): LandmarkValidationResult {
  if (!landmarks || landmarks.length < 33) {
    return {
      isValid: false,
      activeSide: 'front',
      confidence: 0,
      missingLandmarks: ['All (No landmarks detected)'],
    };
  }

  // Calculate visibility for left side vs right side
  let leftTotalVis = 0;
  let rightTotalVis = 0;
  const leftMissing: string[] = [];
  const rightMissing: string[] = [];

  for (const group of jointGroups) {
    const leftLm = landmarks[group.left];
    const rightLm = landmarks[group.right];

    const leftVis = leftLm?.visibility ?? (leftLm ? 1 : 0);
    const rightVis = rightLm?.visibility ?? (rightLm ? 1 : 0);

    leftTotalVis += leftVis;
    rightTotalVis += rightVis;

    if (!leftLm || leftVis < minConfidence) {
      leftMissing.push(`Left ${group.name}`);
    }
    if (!rightLm || rightVis < minConfidence) {
      rightMissing.push(`Right ${group.name}`);
    }
  }

  const leftAvg = jointGroups.length > 0 ? leftTotalVis / jointGroups.length : 0;
  const rightAvg = jointGroups.length > 0 ? rightTotalVis / jointGroups.length : 0;

  // Select dominant side with highest confidence
  const isLeftDominant = leftAvg >= rightAvg;
  const activeSide = Math.abs(leftAvg - rightAvg) > 0.1 ? (isLeftDominant ? 'left' : 'right') : (isLeftDominant ? 'left' : 'right');
  const activeConfidence = isLeftDominant ? leftAvg : rightAvg;
  const missingLandmarks = isLeftDominant ? leftMissing : rightMissing;

  return {
    isValid: missingLandmarks.length === 0 && activeConfidence >= minConfidence,
    activeSide,
    confidence: activeConfidence,
    missingLandmarks,
  };
}

/**
 * Basic landmark validation for explicit indices.
 */
export function validateRequiredLandmarks(
  landmarks: Landmark[],
  requiredIndices: PoseLandmarkIndex[],
  minConfidence: number = 0.4
): LandmarkValidationResult {
  if (!landmarks || landmarks.length < 33) {
    return {
      isValid: false,
      activeSide: 'front',
      confidence: 0,
      missingLandmarks: ['All (No landmarks)'],
    };
  }

  let totalVis = 0;
  const missing: string[] = [];

  for (const idx of requiredIndices) {
    const lm = landmarks[idx];
    const vis = lm?.visibility ?? (lm ? 1 : 0);
    totalVis += vis;
    if (!lm || vis < minConfidence) {
      missing.push(PoseLandmarkIndex[idx] || `Index-${idx}`);
    }
  }

  const avgConfidence = requiredIndices.length > 0 ? totalVis / requiredIndices.length : 0;

  // Determine dominant side
  const leftVis =
    ((landmarks[PoseLandmarkIndex.LEFT_SHOULDER]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_HIP]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.LEFT_ANKLE]?.visibility ?? 0)) / 3;

  const rightVis =
    ((landmarks[PoseLandmarkIndex.RIGHT_SHOULDER]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_HIP]?.visibility ?? 0) +
      (landmarks[PoseLandmarkIndex.RIGHT_ANKLE]?.visibility ?? 0)) / 3;

  let activeSide: 'left' | 'right' | 'front' = 'front';
  if (Math.abs(leftVis - rightVis) > 0.12) {
    activeSide = leftVis > rightVis ? 'left' : 'right';
  }

  return {
    isValid: missing.length === 0 && avgConfidence >= minConfidence,
    activeSide,
    confidence: avgConfidence,
    missingLandmarks: missing,
  };
}
