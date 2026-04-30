import { useState, useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { useReviews } from '../../hooks/useReviews';
import { lifeAreas } from '../../data/lifeAreas';
import { formatDate } from '../../utils/dateHelpers';

export default function CompareReviews() {
  const { reviews } = useReviews();
  const [reviewA, setReviewA] = useState('');
  const [reviewB, setReviewB] = useState('');

  const rA = reviews.find(r => r.id === reviewA);
  const rB = reviews.find(r => r.id === reviewB);

  const radarData = useMemo(() => {
    if (!rA || !rB) return null;
    return {
      labels: lifeAreas.map(a => a.name.split(' ')[0]),
      datasets: [
        {
          label: `A — ${formatDate(rA.createdAt || rA.date)}`,
          data: lifeAreas.map(a => rA.scores[a.id] || 0),
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)',
          borderWidth: 2, pointBackgroundColor: '#6366f1', pointRadius: 4
        },
        {
          label: `B — ${formatDate(rB.createdAt || rB.date)}`,
          data: lifeAreas.map(a => rB.scores[a.id] || 0),
          borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)',
          borderWidth: 2, pointBackgroundColor: '#10b981', pointRadius: 4
        }
      ]
    };
  }, [rA, rB]);

  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, cornerRadius: 8, padding: 12 }
    },
    scales: { r: { min: 0, max: 10, ticks: { stepSize: 2, color: '#475569', backdropColor: 'transparent' }, grid: { color: '#1e293b' }, angleLines: { color: '#1e293b' }, pointLabels: { color: '#94a3b8' } } }
  };

  const getAvg = (r) => r ? (lifeAreas.reduce((s, a) => s + (r.scores[a.id] || 0), 0) / 9).toFixed(1) : 0;

  if (reviews.length < 2) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-4xl mb-3">📊</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Compare Reviews</h1>
        <p className="text-slate-400">You need at least 2 reviews to compare.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Compare Reviews</h1>
      <p className="text-slate-400 text-sm">Select two reviews to see score changes.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {[['a', reviewA, setReviewA, reviewB, 'indigo'], ['b', reviewB, setReviewB, reviewA, 'emerald']].map(([key, val, setter, other, color]) => (
          <div key={key}>
            <label className="block text-sm text-slate-400 mb-1">Review {key.toUpperCase()}</label>
            <select value={val} onChange={e => setter(e.target.value)}
              className={`w-full bg-slate-800/60 border border-${color}-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-${color}-500/50`}>
              <option value="">Select...</option>
              {reviews.map(r => (
                <option key={r.id} value={r.id} disabled={r.id === other}>
                  {r.reviewType} — {formatDate(r.createdAt || r.date)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {rA && rB && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-indigo-400">Review A</p>
              <p className="text-2xl font-bold text-indigo-400">{getAvg(rA)}</p>
            </div>
            <div className="flex items-center justify-center">
              {(() => {
                const diff = (getAvg(rB) - getAvg(rA)).toFixed(1);
                return (
                  <div className={`text-center ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    <p className="text-3xl font-bold">{diff > 0 ? '↑' : diff < 0 ? '↓' : '→'}</p>
                    <p className="text-sm font-medium">{diff > 0 ? '+' : ''}{diff}</p>
                  </div>
                );
              })()}
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-400">Review B</p>
              <p className="text-2xl font-bold text-emerald-400">{getAvg(rB)}</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Score Overlay</h3>
            <div className="h-[400px]"><Radar data={radarData} options={radarOpts} /></div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Area Breakdown</h3>
            <div className="space-y-3">
              {lifeAreas.map(area => {
                const delta = (rB.scores[area.id] || 0) - (rA.scores[area.id] || 0);
                return (
                  <div key={area.id} className="flex items-center gap-3 py-2">
                    <span className="text-lg w-8">{area.icon}</span>
                    <span className="text-sm text-slate-300 flex-1 truncate">{area.name}</span>
                    <span className="text-sm font-bold text-indigo-400 w-8 text-right">{rA.scores[area.id] || 0}</span>
                    <span className="text-lg w-6 text-center text-slate-600">→</span>
                    <span className="text-sm font-bold text-emerald-400 w-8">{rB.scores[area.id] || 0}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-[36px] text-center
                      ${delta > 0 ? 'bg-emerald-500/20 text-emerald-400' : delta < 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
