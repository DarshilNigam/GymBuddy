import { Landmark, PoseLandmarkIndex } from '../../types/pose';
import { PushupDetector } from '../exercises/pushupDetector';
import { SitupDetector } from '../exercises/situpDetector';

function createEmptyLandmarks(): Landmark[] {
  const lms: Landmark[] = [];
  for (let i = 0; i < 33; i++) {
    lms.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 });
  }
  return lms;
}

/**
 * Creates a synthetic side-profile push-up plank pose.
 * progress: 0.0 (top lockout, 180 deg) to 1.0 (bottom depth, 88 deg).
 */
export function createPushupPose(progress: number, visibility: number = 0.95, xOffset: number = 0): Landmark[] {
  const lms = createEmptyLandmarks();

  // Shoulder at (0.25, 0.50)
  lms[PoseLandmarkIndex.LEFT_SHOULDER] = { x: 0.25 + xOffset, y: 0.50, z: 0, visibility };
  lms[PoseLandmarkIndex.RIGHT_SHOULDER] = { x: 0.25 + xOffset, y: 0.50, z: 0, visibility };

  // Hip at (0.55, 0.52) - straight line
  lms[PoseLandmarkIndex.LEFT_HIP] = { x: 0.55 + xOffset, y: 0.52, z: 0, visibility };
  lms[PoseLandmarkIndex.RIGHT_HIP] = { x: 0.55 + xOffset, y: 0.52, z: 0, visibility };

  // Knee at (0.70, 0.53)
  lms[PoseLandmarkIndex.LEFT_KNEE] = { x: 0.70 + xOffset, y: 0.53, z: 0, visibility };
  lms[PoseLandmarkIndex.RIGHT_KNEE] = { x: 0.70 + xOffset, y: 0.53, z: 0, visibility };

  // Ankle at (0.85, 0.55)
  lms[PoseLandmarkIndex.LEFT_ANKLE] = { x: 0.85 + xOffset, y: 0.55, z: 0, visibility };
  lms[PoseLandmarkIndex.RIGHT_ANKLE] = { x: 0.85 + xOffset, y: 0.55, z: 0, visibility };

  // Wrist anchored at ground level (0.25, 0.75)
  lms[PoseLandmarkIndex.LEFT_WRIST] = { x: 0.25 + xOffset, y: 0.75, z: 0, visibility };
  lms[PoseLandmarkIndex.RIGHT_WRIST] = { x: 0.25 + xOffset, y: 0.75, z: 0, visibility };

  // Elbow flexes outward from x=0.25 to x=0.12 at bottom depth
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const elbowX = 0.25 + xOffset - clampedProgress * 0.13;
  lms[PoseLandmarkIndex.LEFT_ELBOW] = { x: elbowX, y: 0.625, z: 0, visibility };
  lms[PoseLandmarkIndex.RIGHT_ELBOW] = { x: elbowX, y: 0.625, z: 0, visibility };

  return lms;
}

/**
 * Creates a synthetic standing upright pose with moving arms / bending.
 * Vertical orientation: Shoulder (0.5, 0.2), Hip (0.5, 0.5), Ankle (0.5, 0.9).
 */
export function createStandingPose(armProgress: number = 0, hipBendProgress: number = 0): Landmark[] {
  const lms = createEmptyLandmarks();

  lms[PoseLandmarkIndex.LEFT_SHOULDER] = { x: 0.5, y: 0.2, z: 0, visibility: 0.95 };
  lms[PoseLandmarkIndex.RIGHT_SHOULDER] = { x: 0.5, y: 0.2, z: 0, visibility: 0.95 };

  const hipOffset = hipBendProgress * 0.2;
  lms[PoseLandmarkIndex.LEFT_HIP] = { x: 0.5 + hipOffset, y: 0.5, z: 0, visibility: 0.95 };
  lms[PoseLandmarkIndex.RIGHT_HIP] = { x: 0.5 + hipOffset, y: 0.5, z: 0, visibility: 0.95 };

  lms[PoseLandmarkIndex.LEFT_KNEE] = { x: 0.5, y: 0.7, z: 0, visibility: 0.95 };
  lms[PoseLandmarkIndex.RIGHT_KNEE] = { x: 0.5, y: 0.7, z: 0, visibility: 0.95 };

  lms[PoseLandmarkIndex.LEFT_ANKLE] = { x: 0.5, y: 0.9, z: 0, visibility: 0.95 };
  lms[PoseLandmarkIndex.RIGHT_ANKLE] = { x: 0.5, y: 0.9, z: 0, visibility: 0.95 };

  const elbowOffset = armProgress * 0.15;
  lms[PoseLandmarkIndex.LEFT_ELBOW] = { x: 0.5 - elbowOffset, y: 0.35, z: 0, visibility: 0.95 };
  lms[PoseLandmarkIndex.RIGHT_ELBOW] = { x: 0.5 - elbowOffset, y: 0.35, z: 0, visibility: 0.95 };
  lms[PoseLandmarkIndex.LEFT_WRIST] = { x: 0.5, y: 0.5, z: 0, visibility: 0.95 };
  lms[PoseLandmarkIndex.RIGHT_WRIST] = { x: 0.5, y: 0.5, z: 0, visibility: 0.95 };

  return lms;
}

/**
 * Creates a synthetic sit-up mat pose.
 * progress: 0.0 (lying flat on back, ~143 deg) to 1.0 (upright peak, ~53 deg).
 * side: 'left' (default) or 'right' dominant profile.
 */
export function createSitupPose(
  progress: number,
  visibility: number = 0.95,
  side: 'left' | 'right' = 'left',
  xOffset: number = 0
): Landmark[] {
  const lms = createEmptyLandmarks();

  // Primary hip position
  lms[PoseLandmarkIndex.LEFT_HIP] = { x: 0.45 + xOffset, y: 0.70, z: 0, visibility: side === 'left' ? visibility : 0.2 };
  lms[PoseLandmarkIndex.RIGHT_HIP] = { x: 0.45 + xOffset, y: 0.70, z: 0, visibility: side === 'right' ? visibility : 0.2 };

  // Knee elevated above floor (y=0.55)
  lms[PoseLandmarkIndex.LEFT_KNEE] = { x: 0.65 + xOffset, y: 0.55, z: 0, visibility: side === 'left' ? visibility : 0.2 };
  lms[PoseLandmarkIndex.RIGHT_KNEE] = { x: 0.65 + xOffset, y: 0.55, z: 0, visibility: side === 'right' ? visibility : 0.2 };

  // Ankle on floor
  lms[PoseLandmarkIndex.LEFT_ANKLE] = { x: 0.80 + xOffset, y: 0.70, z: 0, visibility: side === 'left' ? visibility : 0.2 };
  lms[PoseLandmarkIndex.RIGHT_ANKLE] = { x: 0.80 + xOffset, y: 0.70, z: 0, visibility: side === 'right' ? visibility : 0.2 };

  // Shoulder curls from flat (0.15, 0.70) up to upright (0.45, 0.35)
  const clamped = Math.max(0, Math.min(1, progress));
  const shoulderX = 0.15 + xOffset + clamped * (0.45 - 0.15);
  const shoulderY = 0.70 + clamped * (0.35 - 0.70);

  lms[PoseLandmarkIndex.LEFT_SHOULDER] = { x: shoulderX, y: shoulderY, z: 0, visibility: side === 'left' ? visibility : 0.2 };
  lms[PoseLandmarkIndex.RIGHT_SHOULDER] = { x: shoulderX, y: shoulderY, z: 0, visibility: side === 'right' ? visibility : 0.2 };

  return lms;
}

export function runAllDetectorTests(): { total: number; passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      console.log(`  [PASS] ${name}`);
    } catch (e: any) {
      failed++;
      const msg = `  [FAIL] ${name}: ${e.message}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  console.log('--- RUNNING GYMBUDDY EXERCISE DETECTOR COMPREHENSIVE HARDENING TESTS ---');

  // =========================================================================
  // 1. PUSH-UP TESTS (12 TESTS: 10 REGRESSION + 2 HARDENING SPIKE TESTS)
  // =========================================================================

  test('Pushup FP 1: Standing upright and moving arms must not count reps', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 30; i++) {
      const armProgress = (1 + Math.sin(i * 0.4)) / 2;
      detector.processFrame(createStandingPose(armProgress), t);
      t += 50;
    }
    assert(detector.getRepCount() === 0, `Expected 0 reps, got ${detector.getRepCount()}`);
  });

  test('Pushup FP 2: Standing and bending at hips (good morning) must not count reps', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 30; i++) {
      const hipBend = (1 + Math.sin(i * 0.3)) / 2;
      detector.processFrame(createStandingPose(0, hipBend), t);
      t += 50;
    }
    assert(detector.getRepCount() === 0, `Expected 0 reps, got ${detector.getRepCount()}`);
  });

  test('Pushup FP 3: Walking around / standing upright must not arm or count', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createStandingPose(), t);
      t += 50;
    }
    assert(detector.getTelemetry().isArmed === false, 'Detector should NOT arm while standing');
    assert(detector.getRepCount() === 0, 'No reps should be counted while walking/standing');
  });

  test('Pushup FP 4: 1-frame sudden angle spike must be rejected', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    detector.processFrame(createPushupPose(1.0), t); t += 30;
    detector.processFrame(createPushupPose(0), t); t += 30;
    assert(detector.getRepCount() === 0, 'Single-frame spike must NOT count as a rep');
  });

  test('Pushup FP 5: Landmark visibility drop must cancel candidate and not count', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    detector.processFrame(createPushupPose(0.5), t); t += 100;
    detector.processFrame(createPushupPose(1.0, 0.05), t); t += 100;
    detector.processFrame(createPushupPose(0), t); t += 100;
    assert(detector.getRepCount() === 0, 'Occluded landmarks must NOT count a rep');
  });

  test('Pushup FP 6: Half-rep (returning before reaching depth) must not count', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    detector.processFrame(createPushupPose(0.3), t); t += 100;
    detector.processFrame(createPushupPose(0.4), t); t += 100;
    detector.processFrame(createPushupPose(0.2), t); t += 100;
    detector.processFrame(createPushupPose(0.0), t); t += 100;
    assert(detector.getRepCount() === 0, 'Half-rep must NOT count as a valid rep');
  });

  test('Pushup FP 7: Standing up mid-rep cancels the rep immediately', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    detector.processFrame(createPushupPose(0.5), t); t += 100;
    detector.processFrame(createPushupPose(1.0), t); t += 100;
    detector.processFrame(createStandingPose(), t); t += 100;
    assert(detector.getRepCount() === 0, 'Standing up mid-rep must abort repetition');
  });

  test('Pushup FP 8: Oscillating near threshold without full ROM must not count', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    for (let i = 0; i < 15; i++) {
      const p = 0.45 + (i % 2 === 0 ? 0.1 : -0.1);
      detector.processFrame(createPushupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 0, 'Oscillations near threshold must not count reps');
  });

  test('Pushup FP 9: Sudden whole-body landmark displacement jump (camera shake/pop) does not count rep', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    // Sudden displacement jump across screen (x offset = 0.35)
    detector.processFrame(createPushupPose(1.0, 0.95, 0.35), t); t += 50;
    detector.processFrame(createPushupPose(0.0, 0.95, 0.0), t); t += 50;
    assert(detector.getRepCount() === 0, 'Displacement jump must be rejected');
  });

  test('Pushup TP 1: Single full valid push-up counts exactly 1 rep', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    assert(detector.getTelemetry().isArmed === true, 'Detector must be ARMED after holding start plank');

    const descentSteps = [0.3, 0.6, 0.9, 1.0, 1.0, 0.7, 0.4, 0.1, 0.0, 0.0];
    for (const p of descentSteps) {
      detector.processFrame(createPushupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 1, `Expected 1 valid rep, got ${detector.getRepCount()}`);
  });

  test('Pushup TP 2: Fast continuous push-up (720ms) counts exactly 1 rep', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }
    const fastSteps = [0.2, 0.4, 0.7, 1.0, 1.0, 1.0, 0.7, 0.4, 0.2, 0.0];
    for (const p of fastSteps) {
      detector.processFrame(createPushupPose(p), t);
      t += 80;
    }
    assert(detector.getRepCount() === 1, `Expected 1 valid fast rep, got ${detector.getRepCount()}`);
  });

  test('Pushup TP 3: Two consecutive valid push-ups count exactly 2 reps', () => {
    const detector = new PushupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createPushupPose(0), t);
      t += 50;
    }

    // Rep 1
    const steps1 = [0.3, 0.6, 0.9, 1.0, 1.0, 0.7, 0.4, 0.1, 0.0, 0.0];
    for (const p of steps1) {
      detector.processFrame(createPushupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 1, `Expected 1 rep after rep 1, got ${detector.getRepCount()}`);

    // Wait past cooldown
    t += 200;
    detector.processFrame(createPushupPose(0), t); t += 50;

    // Rep 2
    for (const p of steps1) {
      detector.processFrame(createPushupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 2, `Expected 2 reps after rep 2, got ${detector.getRepCount()}`);
  });

  // =========================================================================
  // 2. SIT-UP TESTS (22 COMPREHENSIVE HARDENING TESTS)
  // =========================================================================

  test('Situp TP 1: Normal standard sit-up counts exactly 1 rep', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    assert(detector.getTelemetry().isArmed === true, 'Detector must be ARMED');

    const situpSteps = [0.3, 0.6, 0.9, 1.0, 1.0, 0.7, 0.4, 0.1, 0.0, 0.0];
    for (const p of situpSteps) {
      detector.processFrame(createSitupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 1, `Expected exactly 1 valid sit-up, got ${detector.getRepCount()}`);
  });

  test('Situp TP 2: Slow controlled sit-up (1.8s) counts exactly 1 rep', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }

    const slowSteps = [0.2, 0.4, 0.6, 0.8, 1.0, 1.0, 1.0, 0.8, 0.6, 0.4, 0.2, 0.0, 0.0];
    for (const p of slowSteps) {
      detector.processFrame(createSitupPose(p), t);
      t += 150;
    }
    assert(detector.getRepCount() === 1, `Expected exactly 1 valid slow sit-up, got ${detector.getRepCount()}`);
  });

  test('Situp TP 3: Fast athletic continuous sit-up (640ms) counts exactly 1 rep', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }

    const fastSteps = [0.3, 0.7, 1.0, 1.0, 0.6, 0.2, 0.0, 0.0];
    for (const p of fastSteps) {
      detector.processFrame(createSitupPose(p), t);
      t += 80;
    }
    assert(detector.getRepCount() === 1, `Expected exactly 1 fast valid sit-up, got ${detector.getRepCount()}`);
  });

  test('Situp TP 4: Two consecutive valid sit-ups count exactly 2 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }

    // Rep 1
    const steps1 = [0.3, 0.6, 0.9, 1.0, 1.0, 0.7, 0.4, 0.1, 0.0, 0.0];
    for (const p of steps1) {
      detector.processFrame(createSitupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 1, `Expected 1 rep after rep 1, got ${detector.getRepCount()}`);

    // Wait past cooldown
    t += 150;
    detector.processFrame(createSitupPose(0), t); t += 50;

    // Rep 2
    for (const p of steps1) {
      detector.processFrame(createSitupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 2, `Expected 2 reps after rep 2, got ${detector.getRepCount()}`);
  });

  test('Situp TP 5: Left-side profile orientation counts exactly 1 rep', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0, 0.95, 'left'), t);
      t += 50;
    }
    const steps = [0.3, 0.6, 0.9, 1.0, 1.0, 0.7, 0.4, 0.1, 0.0, 0.0];
    for (const p of steps) {
      detector.processFrame(createSitupPose(p, 0.95, 'left'), t);
      t += 100;
    }
    assert(detector.getRepCount() === 1, 'Left-side profile must count valid rep');
  });

  test('Situp TP 6: Right-side profile orientation counts exactly 1 rep', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0, 0.95, 'right'), t);
      t += 50;
    }
    const steps = [0.3, 0.6, 0.9, 1.0, 1.0, 0.7, 0.4, 0.1, 0.0, 0.0];
    for (const p of steps) {
      detector.processFrame(createSitupPose(p, 0.95, 'right'), t);
      t += 100;
    }
    assert(detector.getRepCount() === 1, 'Right-side profile must count valid rep');
  });

  test('Situp TP 7: Temporary landmark dropout (2 frames) recovered and counts 1 rep', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }

    detector.processFrame(createSitupPose(0.3), t); t += 100;
    detector.processFrame(createSitupPose(0.6), t); t += 100;
    detector.processFrame(createSitupPose(0.8, 0.05), t); t += 100;
    detector.processFrame(createSitupPose(0.9, 0.05), t); t += 100;
    detector.processFrame(createSitupPose(1.0, 0.95), t); t += 100;
    detector.processFrame(createSitupPose(1.0, 0.95), t); t += 100;
    detector.processFrame(createSitupPose(0.6, 0.95), t); t += 100;
    detector.processFrame(createSitupPose(0.2, 0.95), t); t += 100;
    detector.processFrame(createSitupPose(0.0, 0.95), t); t += 100;
    detector.processFrame(createSitupPose(0.0, 0.95), t); t += 100;

    assert(detector.getRepCount() === 1, 'Temporary dropout must be recovered and count rep');
  });

  test('Situp FP 1: Sudden angle spike (1-frame 0 -> 1.0 -> 0) produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    // Sudden 1-frame spike
    detector.processFrame(createSitupPose(1.0), t); t += 30;
    detector.processFrame(createSitupPose(0), t); t += 30;
    assert(detector.getRepCount() === 0, '1-frame angle spike must not count');
  });

  test('Situp FP 2: Sudden whole-body landmark displacement jump produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    // Displacement jump (e.g. tracking pop x offset 0.35)
    detector.processFrame(createSitupPose(1.0, 0.95, 'left', 0.35), t); t += 50;
    detector.processFrame(createSitupPose(0.0, 0.95, 'left', 0.0), t); t += 50;
    assert(detector.getRepCount() === 0, 'Landmark displacement jump must not count');
  });

  test('Situp FP 3: Partial rise (half sit-up, returning before peak) produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    detector.processFrame(createSitupPose(0.2), t); t += 100;
    detector.processFrame(createSitupPose(0.4), t); t += 100;
    detector.processFrame(createSitupPose(0.2), t); t += 100;
    detector.processFrame(createSitupPose(0.0), t); t += 100;
    assert(detector.getRepCount() === 0, 'Half sit-up must not count');
  });

  test('Situp FP 4: Partial return (hovering at 100 deg without returning flat) produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    detector.processFrame(createSitupPose(0.4), t); t += 100;
    detector.processFrame(createSitupPose(1.0), t); t += 100;
    detector.processFrame(createSitupPose(1.0), t); t += 100;
    detector.processFrame(createSitupPose(0.4), t); t += 100;
    assert(detector.getRepCount() === 0, 'Partial return must not count rep');
  });

  test('Situp FP 5: Holding at top (upright peak) does not repeatedly count', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    detector.processFrame(createSitupPose(0.5), t); t += 100;
    for (let i = 0; i < 20; i++) {
      detector.processFrame(createSitupPose(1.0), t);
      t += 100;
    }
    assert(detector.getRepCount() === 0, 'Holding top position must NOT increment rep count');
  });

  test('Situp FP 6: Holding at bottom (lying flat) does not repeatedly count', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 30; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 100;
    }
    assert(detector.getRepCount() === 0, 'Holding flat position must NOT count reps');
  });

  test('Situp FP 7: Standing upright produces 0 reps and does not arm', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 30; i++) {
      detector.processFrame(createStandingPose(0, 0), t);
      t += 50;
    }
    assert(detector.getRepCount() === 0, 'Standing upright must not count sit-up reps');
    assert(detector.getTelemetry().isArmed === false, 'Should not arm while standing');
  });

  test('Situp FP 8: Standing and bending at hips (good morning) produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 30; i++) {
      const hipBend = (1 + Math.sin(i * 0.3)) / 2;
      detector.processFrame(createStandingPose(0, hipBend), t);
      t += 50;
    }
    assert(detector.getRepCount() === 0, 'Standing hip bend must not count');
  });

  test('Situp FP 9: Walking around produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createStandingPose(), t);
      t += 50;
    }
    assert(detector.getRepCount() === 0, 'Walking around must not count');
  });

  test('Situp FP 10: Arm waving while standing produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 30; i++) {
      const armProgress = (1 + Math.sin(i * 0.4)) / 2;
      detector.processFrame(createStandingPose(armProgress, 0), t);
      t += 50;
    }
    assert(detector.getRepCount() === 0, 'Arm waving must not count');
  });

  test('Situp FP 11: Random torso/hip movement produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 30; i++) {
      const p = (1 + Math.sin(i * 0.5)) / 2;
      detector.processFrame(createStandingPose(0, p), t);
      t += 50;
    }
    assert(detector.getRepCount() === 0, 'Random movement must not count');
  });

  test('Situp FP 12: Prolonged landmark loss (>700ms) disarms and produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    detector.processFrame(createSitupPose(0.5), t); t += 100;
    for (let i = 0; i < 12; i++) {
      detector.processFrame([], t);
      t += 100;
    }
    detector.processFrame(createSitupPose(0), t); t += 100;
    assert(detector.getRepCount() === 0, 'Prolonged dropout must cancel candidate');
    assert(detector.getTelemetry().isArmed === false, 'Detector should be disarmed after prolonged loss');
  });

  test('Situp FP 13: Repeated threshold oscillation (<45 deg ROM) produces 0 reps', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 15; i++) {
      detector.processFrame(createSitupPose(0), t);
      t += 50;
    }
    for (let i = 0; i < 12; i++) {
      const p = 0.5 + (i % 2 === 0 ? 0.08 : -0.08);
      detector.processFrame(createSitupPose(p), t);
      t += 100;
    }
    assert(detector.getRepCount() === 0, 'Small oscillations must not count reps');
  });

  test('Situp FP 14: Starting while already sitting upright does not arm or count', () => {
    const detector = new SitupDetector();
    let t = 1000;
    for (let i = 0; i < 25; i++) {
      detector.processFrame(createSitupPose(1.0), t);
      t += 50;
    }
    assert(detector.getTelemetry().isArmed === false, 'Starting while already sitting upright must NOT arm');
  });

  console.log(`--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  return { total: passed + failed, passed, failed, errors };
}
