import { Landmark } from '../../types/pose';

/**
 * Calculates the internal angle (in degrees, [0, 180]) between three 2D points with point B as the vertex.
 * Vector BA and Vector BC.
 */
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  if (!a || !b || !c) return 0;

  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return Math.round(angle * 10) / 10;
}

/**
 * Calculates Euclidean distance between two landmarks in normalized coordinates.
 */
export function calculateDistance(a: Landmark, b: Landmark): number {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates vertical inclination angle with respect to the vertical Y-axis.
 */
export function calculateVerticalAngle(top: Landmark, bottom: Landmark): number {
  if (!top || !bottom) return 0;
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  const radians = Math.atan2(Math.abs(dx), Math.abs(dy));
  return (radians * 180.0) / Math.PI;
}
