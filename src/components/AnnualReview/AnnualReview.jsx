import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useReviews } from '../../hooks/useReviews';
import { useGoals } from '../../hooks/useGoals';
import { useStreaks } from '../../hooks/useStreaks';
import { lifeAreas } from '../../data/lifeAreas';

export default function AnnualReview() {
  const { reviews } = useReviews();
  const { goals } = useGoals();
  const stats = useStreaks(reviews);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const years = useMemo(() => {
    const yrs = new Set(reviews.map(r => new Date(r.createdAt || r.date).getFullYear()));
    yrs.add(currentYear);
    return [...yrs].sort((a, b) => b - a);
  }, [reviews]);

  const yearReviews = useMemo(() =>
    reviews.filter(r => new Date(r.createdAt || r.date).getFullYear() === year)
  , [reviews, year]);

  // Monthly averages
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ month: i, reviews: [], avg: 0 }));
    yearReviews.forEach(r => {
      const m = new Date(r.createdAt || r.date).getMonth();
      months[m].reviews.push(r);
    });
    months.forEach(m => {
      if (m.reviews.length === 0) { m.avg = null; return; }
      const total = m.reviews.reduce((sum, r) =>
        sum + lifeAreas.reduce((s, a) => s + (r.scores[a.id] || 0), 0) / 9, 0);
      m.avg = (total / m.reviews.length).toFixed(1);
    });
    return months;
  }, [yearReviews]);

  // Best/Worst months
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const activeMonths = monthlyData.filter(m => m.avg !== null);
  const bestMonth = activeMonths.length > 0 ? activeMonths.reduce((a, b) => +a.avg > +b.avg ? a : b) : null;
  const worstMonth = activeMonths.length > 0 ? activeMonths.reduce((a, b) => +a.avg < +b.avg ? a : b) : null;

  // Area rankings
  const areaRankings = useMemo(() => {
    if (yearReviews.length === 0) return [];
    return lifeAreas.map(area => {
      const avg = yearReviews.reduce((sum, r) => sum + (r.scores[area.id] || 0), 0) / yearReviews.length;
      return { ...area, avg: avg.toFixed(1) };
    }).sort((a, b) => b.avg - a.avg);
  }, [yearReviews]);

  // Goals completed this year
  const yearGoals = goals.filter(g =>
    g.status === 'completed' && g.completedAt && new Date(g.completedAt).getFullYear() === year
  );

  const chartData = {
    labels: monthNames,
    datasets: [{
      label: 'Monthly Average',
      data: monthlyData.map(m => m.avg),
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
      borderWidth: 2, pointBackgroundColor: '#6366f1', pointRadius: 4,
      tension: 0.4, fill: true, spanGaps: true
    }]
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, cornerRadius: 8 } },
    scales: { y: { min: 0, max: 10, ticks: { color: '#475569' }, grid: { color: '#1e293b' } }, x: { ticks: { color: '#94a3b8' }, grid: { display: false } } }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Year in Review</h1>
        <select value={year} onChange={e => setYear(+e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {yearReviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-400">No reviews found for {year}.</p>
        </div>
      ) : (
        <>
          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-400">{yearReviews.length}</p>
              <p className="text-xs text-slate-400 mt-1">Reviews</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{yearGoals.length}</p>
              <p className="text-xs text-slate-400 mt-1">Goals Done</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.longestStreak}</p>
              <p className="text-xs text-slate-400 mt-1">Best Streak</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-rose-400">
                {(yearReviews.reduce((s, r) => s + lifeAreas.reduce((a, ar) => a + (r.scores[ar.id] || 0), 0) / 9, 0) / yearReviews.length).toFixed(1)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Year Avg</p>
            </div>
          </div>

          {/* Best/Worst Month */}
          <div className="grid grid-cols-2 gap-4">
            {bestMonth && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Best Month</p>
                <p className="text-xl font-bold text-slate-100 mt-1">{monthNames[bestMonth.month]}</p>
                <p className="text-sm text-emerald-400">{bestMonth.avg} avg</p>
              </div>
            )}
            {worstMonth && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-red-400 uppercase tracking-wider font-semibold">Hardest Month</p>
                <p className="text-xl font-bold text-slate-100 mt-1">{monthNames[worstMonth.month]}</p>
                <p className="text-sm text-red-400">{worstMonth.avg} avg</p>
              </div>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Monthly Trend</h3>
            <div className="h-[250px]"><Line data={chartData} options={chartOpts} /></div>
          </div>

          {/* Area Rankings */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Area Rankings</h3>
            <div className="space-y-2">
              {areaRankings.map((area, i) => (
                <div key={area.id} className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 w-5 font-bold">#{i + 1}</span>
                  <span className="text-lg">{area.icon}</span>
                  <span className="text-sm text-slate-300 flex-1">{area.name}</span>
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${area.avg * 10}%`, backgroundColor: area.color }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right" style={{ color: area.color }}>{area.avg}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
