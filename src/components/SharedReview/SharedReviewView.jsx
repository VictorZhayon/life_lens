import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSharedReview } from '../../services/shareService';
import { lifeAreas } from '../../data/lifeAreas';

export default function SharedReviewView() {
  const { token } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSharedReview(token);
        if (!data) setError('This shared review has expired or does not exist.');
        else setReview(data);
      } catch (err) { setError('Failed to load shared review.'); }
      finally { setLoading(false); }
    }
    load();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="text-4xl">🔗</p>
        <p className="text-slate-400">{error}</p>
        <a href="/" className="text-indigo-400 text-sm hover:text-indigo-300">Go to LifeLens →</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-800">
          <p className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            LifeLens
          </p>
          <h1 className="text-xl font-bold text-slate-100 capitalize">
            {review.reviewType} Review
          </h1>
          <p className="text-slate-500 text-sm">{new Date(review.date).toLocaleDateString()}</p>
          {review.mood && <p className="text-2xl">{review.mood}</p>}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3">
          {lifeAreas.map(area => (
            <div key={area.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
              <span>{area.icon}</span>
              <p className="text-xs text-slate-400 truncate">{area.name.split(' ')[0]}</p>
              <p className="text-lg font-bold" style={{ color: area.color }}>{review.scores[area.id] || 0}</p>
            </div>
          ))}
        </div>

        {/* Insights */}
        {review.insights && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
              <p className="text-lg font-semibold italic text-slate-100">"{review.insights.headline}"</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-xs text-amber-400 font-semibold uppercase">Focus Area</p>
              <p className="text-slate-200 font-medium">{review.insights.focus_area}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            Shared via <span className="font-semibold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">LifeLens</span> · Personal Review & Re-strategy Planner
          </p>
        </div>
      </div>
    </div>
  );
}
