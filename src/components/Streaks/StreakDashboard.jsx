import { useStreaks } from '../../hooks/useStreaks';
import { useReviews } from '../../hooks/useReviews';

export default function StreakDashboard({ compact = false }) {
  const { reviews } = useReviews();
  const stats = useStreaks(reviews);

  if (reviews.length === 0 && compact) return null;

  // Heatmap rendering (last 90 days)
  const heatmapEntries = Object.entries(stats.heatmap).sort(([a], [b]) => a.localeCompare(b));

  const getHeatColor = (count) => {
    if (count === 0) return 'bg-slate-800/50';
    if (count === 1) return 'bg-indigo-500/40';
    if (count === 2) return 'bg-indigo-500/70';
    return 'bg-indigo-500';
  };

  if (compact) {
    // Compact version for Dashboard
    return (
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Streak</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold text-amber-400">{stats.currentStreak}</span>
            <span className="text-xs text-slate-500 ml-1">weeks</span>
          </div>
        </div>

        {/* Mini badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {stats.earnedBadges.slice(0, 4).map(badge => (
            <span key={badge.id} className="text-lg" title={badge.name}>
              {badge.icon}
            </span>
          ))}
          {stats.earnedBadges.length > 4 && (
            <span className="text-xs text-slate-500 flex items-center">
              +{stats.earnedBadges.length - 4} more
            </span>
          )}
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-slate-200">{stats.totalReviews}</p>
            <p className="text-[10px] text-slate-500">Total</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-200">{stats.longestStreak}</p>
            <p className="text-[10px] text-slate-500">Best Streak</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-200">{stats.uniqueWeeks}</p>
            <p className="text-[10px] text-slate-500">Active Weeks</p>
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="space-y-6">
      {/* Streak Counter */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-5xl animate-pulse">🔥</span>
          <div>
            <p className="text-5xl font-bold text-amber-400">{stats.currentStreak}</p>
            <p className="text-sm text-slate-400">week streak</p>
          </div>
        </div>
        {stats.longestStreak > stats.currentStreak && (
          <p className="text-xs text-slate-500 mt-2">
            Personal best: {stats.longestStreak} weeks
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{stats.totalReviews}</p>
          <p className="text-xs text-slate-400 mt-1">Total Reviews</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.uniqueWeeks}</p>
          <p className="text-xs text-slate-400 mt-1">Active Weeks</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.longestStreak}</p>
          <p className="text-xs text-slate-400 mt-1">Best Streak</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-rose-400">{stats.currentStreak}</p>
          <p className="text-xs text-slate-400 mt-1">Current Streak</p>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats.allBadges.map(badge => {
            const earned = stats.earnedBadges.some(b => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all
                  ${earned
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-slate-700 bg-slate-800/30 opacity-40'}`}
              >
                <span className={`text-2xl ${earned ? 'animate-badgeGlow' : 'grayscale'}`}>
                  {badge.icon}
                </span>
                <p className={`text-xs font-medium mt-1 ${earned ? 'text-slate-200' : 'text-slate-500'}`}>
                  {badge.name}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Review Activity (Last 90 Days)
        </h3>
        <div className="flex flex-wrap gap-1">
          {heatmapEntries.map(([date, count]) => (
            <div
              key={date}
              title={`${date}: ${count} review${count !== 1 ? 's' : ''}`}
              className={`w-3 h-3 rounded-sm ${getHeatColor(count)} transition-colors`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500/40" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500/70" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500" />
          <span>More</span>
        </div>
      </div>

      {/* By Type */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{stats.byType.weekly}</p>
          <p className="text-xs text-slate-400 mt-1">Weekly</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.byType.monthly}</p>
          <p className="text-xs text-slate-400 mt-1">Monthly</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.byType.quarterly}</p>
          <p className="text-xs text-slate-400 mt-1">Quarterly</p>
        </div>
      </div>
    </div>
  );
}
