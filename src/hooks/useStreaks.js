import { useMemo } from 'react';

/**
 * Streak badge definitions.
 */
const BADGES = [
  { id: 'starter', name: 'Getting Started', icon: '🌱', threshold: 1, description: 'Complete your first review' },
  { id: 'streak-3', name: 'On a Roll', icon: '🔥', threshold: 3, description: '3 consecutive reviews' },
  { id: 'streak-7', name: 'Week Warrior', icon: '⚡', threshold: 7, description: '7 consecutive reviews' },
  { id: 'streak-12', name: 'Quarterly Champion', icon: '🏆', threshold: 12, description: '12 consecutive reviews' },
  { id: 'streak-26', name: 'Half-Year Hero', icon: '💎', threshold: 26, description: '26 consecutive reviews' },
  { id: 'streak-52', name: 'Year Master', icon: '👑', threshold: 52, description: '52 consecutive reviews' },
  { id: 'reviews-10', name: 'Dedicated', icon: '📝', threshold: 10, description: 'Complete 10 total reviews', type: 'total' },
  { id: 'reviews-25', name: 'Committed', icon: '💪', threshold: 25, description: 'Complete 25 total reviews', type: 'total' },
  { id: 'reviews-50', name: 'Unstoppable', icon: '🚀', threshold: 50, description: 'Complete 50 total reviews', type: 'total' },
  { id: 'reviews-100', name: 'Centurion', icon: '🏅', threshold: 100, description: 'Complete 100 total reviews', type: 'total' }
];

/**
 * Calculate weekly streaks from review dates.
 * A "streak" means consecutive weeks with at least one review.
 */
function calculateWeeklyStreak(reviews) {
  if (reviews.length === 0) return { current: 0, longest: 0 };

  // Get unique weeks (ISO week numbers)
  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - startOfYear) / 86400000);
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${weekNum}`;
  };

  const weekKeys = [...new Set(
    reviews.map(r => getWeekKey(r.createdAt || r.date))
  )].sort().reverse();

  if (weekKeys.length === 0) return { current: 0, longest: 0 };

  // Check if current week is in the list
  const currentWeekKey = getWeekKey(new Date().toISOString());
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekKey = getWeekKey(lastWeekDate.toISOString());

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Start counting from the most recent week
  const startsFromCurrent = weekKeys[0] === currentWeekKey || weekKeys[0] === lastWeekKey;

  if (startsFromCurrent) {
    currentStreak = 1;
    for (let i = 1; i < weekKeys.length; i++) {
      const [year1, w1] = weekKeys[i - 1].split('-W').map(Number);
      const [year2, w2] = weekKeys[i].split('-W').map(Number);

      const diff = (year1 === year2) ? (w1 - w2) : ((year1 - year2) * 52 + w1 - w2);

      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < weekKeys.length; i++) {
    const [year1, w1] = weekKeys[i - 1].split('-W').map(Number);
    const [year2, w2] = weekKeys[i].split('-W').map(Number);

    const diff = (year1 === year2) ? (w1 - w2) : ((year1 - year2) * 52 + w1 - w2);

    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Build a heatmap of review activity for the last N days.
 */
function buildHeatmap(reviews, days = 90) {
  const map = {};
  const now = new Date();

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  // Count reviews per day
  reviews.forEach(r => {
    const key = (r.createdAt || r.date || '').slice(0, 10);
    if (key in map) {
      map[key]++;
    }
  });

  return map;
}

/**
 * Hook to compute streaks, badges, and heatmap data from reviews.
 */
export function useStreaks(reviews) {
  const stats = useMemo(() => {
    const weeklyStreak = calculateWeeklyStreak(reviews);
    const totalReviews = reviews.length;

    // Calculate review weeks for consistency
    const uniqueWeeks = new Set(
      reviews.map(r => {
        const d = new Date(r.createdAt || r.date);
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor((d - startOfYear) / 86400000);
        return `${d.getFullYear()}-W${Math.ceil((days + startOfYear.getDay() + 1) / 7)}`;
      })
    ).size;

    // Determine earned badges
    const earnedBadges = BADGES.filter(badge => {
      if (badge.type === 'total') {
        return totalReviews >= badge.threshold;
      }
      return weeklyStreak.longest >= badge.threshold;
    });

    // Heatmap
    const heatmap = buildHeatmap(reviews, 90);

    // Reviews by type counts
    const byType = {
      weekly: reviews.filter(r => r.reviewType === 'weekly').length,
      monthly: reviews.filter(r => r.reviewType === 'monthly').length,
      quarterly: reviews.filter(r => r.reviewType === 'quarterly').length
    };

    return {
      currentStreak: weeklyStreak.current,
      longestStreak: weeklyStreak.longest,
      totalReviews,
      uniqueWeeks,
      earnedBadges,
      allBadges: BADGES,
      heatmap,
      byType
    };
  }, [reviews]);

  return stats;
}

export default useStreaks;
