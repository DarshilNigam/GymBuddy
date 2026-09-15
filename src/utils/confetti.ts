import confetti from 'canvas-confetti';

export function fireWorkoutCelebration() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#00F5A0', '#00D9F5', '#FFFFFF'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#00F5A0', '#3B82F6', '#10B981'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#00F5A0', '#00D9F5', '#F59E0B'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#00F5A0', '#6366F1', '#38BDF8'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#00F5A0', '#FFFFFF', '#00D9F5'],
  });
}
