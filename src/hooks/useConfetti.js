import confetti from 'canvas-confetti';
import { useCallback } from 'react';

export function useConfetti() {
  const fireConfetti = useCallback((options = {}) => {
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6']
    };

    confetti({ ...defaults, ...options });
  }, []);

  const fireBadgeConfetti = useCallback(() => {
    // Double burst from sides
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#f59e0b', '#fbbf24'] });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f59e0b', '#fbbf24'] });
  }, []);

  const fireGoalConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3, angle: 60, spread: 55, origin: { x: 0 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
      confetti({
        particleCount: 3, angle: 120, spread: 55, origin: { x: 1 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return { fireConfetti, fireBadgeConfetti, fireGoalConfetti };
}

export default useConfetti;
