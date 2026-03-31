import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { lifeAreas } from '../../data/lifeAreas';
import { formatDate } from '../../utils/dateHelpers';
import prompts from '../../data/prompts';

export default function HistoryView() {
  const navigate = useNavigate();
  const { reviews, deleteReview, loading } = useReviews();
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.reviewType === filter);

  const typeColors = {
    weekly: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    monthly: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    quarterly: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };

  const areaMap = {};
  lifeAreas.forEach(a => { areaMap[a.id] = a; });

  if (selectedReview) {
    const handleDelete = async () => {
      if (!showDeleteConfirm) {
        setShowDeleteConfirm(true);
        return;
      }
      await deleteReview(selectedReview.id);
      setSelectedReview(null);
      setShowDeleteConfirm(false);
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => { setSelectedReview(null); setShowDeleteConfirm(false); }}
          className="text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          ← Back to History
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {selectedReview.reviewType.charAt(0).toUpperCase() + selectedReview.reviewType.slice(1)} Review
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {formatDate(selectedReview.createdAt || selectedReview.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!showDeleteConfirm ? (
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm
                  hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 text-slate-400 text-sm hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm
                    hover:bg-red-600 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3">
          {lifeAreas.map(area => (
            <div key={area.id} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700">
              <span>{area.icon}</span>
              <p className="text-xs text-slate-400 truncate">{area.name}</p>
              <p className="text-lg font-bold" style={{ color: area.color }}>
                {selectedReview.scores[area.id]}
              </p>
            </div>
          ))}
        </div>

        {/* Full Insights */}
        {selectedReview.insights && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              AI Insights
            </h3>

            {/* Headline */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-xl p-5 text-center">
              <p className="text-lg font-semibold text-slate-100 leading-relaxed italic">
                "{selectedReview.insights.headline}"
              </p>
            </div>

            {/* Focus Area */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Priority Focus Area
              </h4>
              <p className="text-slate-200 font-medium">{selectedReview.insights.focus_area}</p>
            </div>

            {/* Score Summary */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Score Summary
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">{selectedReview.insights.score_summary}</p>
            </div>

            {/* Strengths / Weaknesses / Improvements */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {selectedReview.insights.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
                  Areas of Concern
                </h4>
                <ul className="space-y-1.5">
                  {selectedReview.insights.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                  Improvements
                </h4>
                <ul className="space-y-1.5">
                  {selectedReview.insights.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Answers */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Reflection Answers
          </h3>
          {lifeAreas.map(area => {
            const areaAnswers = selectedReview.answers[area.id] || [];
            const areaPrompts = prompts[area.id]?.[selectedReview.reviewType] || [];
            const hasAnswers = areaAnswers.some(a => a && a.trim());
            if (!hasAnswers) return null;

            return (
              <div key={area.id} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
                  <span>{area.icon}</span> {area.name}
                  <span className="ml-auto text-lg font-bold" style={{ color: area.color }}>
                    {selectedReview.scores[area.id]}/10
                  </span>
                </h3>
                <div className="space-y-3">
                  {areaPrompts.map((prompt, idx) => (
                    areaAnswers[idx] && areaAnswers[idx].trim() && (
                      <div key={idx}>
                        <p className="text-xs text-slate-400 mb-1">{prompt}</p>
                        <p className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3">
                          {areaAnswers[idx]}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Review History</h1>
        <button
          onClick={() => navigate('/review')}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm
            hover:bg-indigo-400 transition-all font-medium"
        >
          + New Review
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'weekly', 'monthly', 'quarterly'].map(f => (
          <button
            key={f}
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${filter === f
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400">No reviews yet. Start your first review!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map(review => {
            const avgScore = lifeAreas.reduce((sum, a) => sum + (review.scores[a.id] || 0), 0) / 9;

            return (
              <button
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-xl p-4
                  hover:border-slate-600 hover:bg-slate-800/70 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                      ${typeColors[review.reviewType]}`}>
                      {review.reviewType}
                    </span>
                    <p className="text-slate-300 font-medium mt-2">
                      {formatDate(review.createdAt || review.date)}
                    </p>
                    {review.insights?.headline && (
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-md">
                        "{review.insights.headline}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-200">{avgScore.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">avg score</p>
                  </div>
                </div>

                {/* Mini score dots */}
                <div className="flex gap-1.5 mt-3">
                  {lifeAreas.map(area => (
                    <div
                      key={area.id}
                      title={`${area.name}: ${review.scores[area.id]}`}
                      className="w-6 h-1.5 rounded-full"
                      style={{
                        backgroundColor: area.color,
                        opacity: (review.scores[area.id] || 5) / 10
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
