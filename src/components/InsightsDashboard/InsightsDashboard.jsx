import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { generateInsights } from '../../services/gemini';
import { lifeAreas } from '../../data/lifeAreas';

export default function InsightsDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReviewById, updateReviewInsights } = useReviews();

  const [review, setReview] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const r = getReviewById(id);
    if (!r) {
      navigate('/history');
      return;
    }
    setReview(r);

    if (r.insights) {
      setInsights(r.insights);
      setLoading(false);
    } else {
      fetchInsights(r);
    }
  }, [id]);

  const fetchInsights = async (r) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateInsights(r.scores, r.answers, r.reviewType);
      setInsights(result);
      updateReviewInsights(r.id, result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (review) fetchInsights(review);
  };

  if (!review) return null;

  const areaMap = {};
  lifeAreas.forEach(a => { areaMap[a.id] = a; });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-100">AI Insights</h1>
        <p className="text-slate-400 mt-1 capitalize">{review.reviewType} Review</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Generating AI insights...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Insights Display */}
      {insights && !loading && (
        <>
          {/* Headline */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
            <p className="text-lg font-semibold text-slate-100 leading-relaxed">
              "{insights.headline}"
            </p>
          </div>

          {/* Focus Area */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Priority Focus Area
            </h3>
            <p className="text-slate-200 font-medium">{insights.focus_area}</p>
          </div>

          {/* Score Summary */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Score Summary
            </h3>
            <p className="text-slate-300 leading-relaxed">{insights.score_summary}</p>
          </div>

          {/* 3-Column Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Strengths */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                Strengths
              </h3>
              <ul className="space-y-2">
                {insights.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
                Areas of Concern
              </h3>
              <ul className="space-y-2">
                {insights.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
                Improvements
              </h3>
              <ul className="space-y-2">
                {insights.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scores Grid */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Life Area Scores
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {lifeAreas.map(area => (
                <div key={area.id} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700">
                  <span className="text-lg">{area.icon}</span>
                  <p className="text-xs text-slate-400 mt-1 truncate">{area.name.split(' ')[0]}</p>
                  <p className="text-xl font-bold" style={{ color: area.color }}>
                    {review.scores[area.id]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Regenerate Button */}
          <div className="text-center pt-4">
            <button
              id="regenerate-insights-btn"
              onClick={handleRegenerate}
              className="px-6 py-2.5 bg-slate-800 text-slate-300 border border-slate-700
                rounded-xl hover:border-indigo-500 hover:text-indigo-400
                transition-all duration-200"
            >
              Regenerate Insights
            </button>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={() => navigate('/history')}
          className="px-6 py-2.5 text-slate-400 border border-slate-700 rounded-xl
            hover:border-slate-600 hover:text-slate-300 transition-all"
        >
          View History
        </button>
        <button
          onClick={() => navigate('/review')}
          className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl
            hover:bg-indigo-400 transition-all font-medium"
        >
          New Review
        </button>
      </div>
    </div>
  );
}
