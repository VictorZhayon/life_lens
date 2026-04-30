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
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.reviewType === filter);

  const typeColors = {
    weekly: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    monthly: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    quarterly: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };

  if (selectedReview) {
    const handleDelete = async () => {
      if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
      await deleteReview(selectedReview.id);
      setSelectedReview(null);
      setShowDeleteConfirm(false);
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => { setSelectedReview(null); setShowDeleteConfirm(false); }}
          className="text-slate-400 hover:text-slate-200 transition-colors text-sm">← Back to History</button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {selectedReview.reviewType.charAt(0).toUpperCase() + selectedReview.reviewType.slice(1)} Review
            </h2>
            <p className="text-slate-400 text-sm mt-1">{formatDate(selectedReview.createdAt || selectedReview.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            {!showDeleteConfirm ? (
              <button onClick={handleDelete}
                className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-2 text-slate-400 text-sm">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">Confirm Delete</button>
              </div>
            )}
          </div>
        </div>

        {/* Mood */}
        {selectedReview.mood && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <span className="text-3xl">{selectedReview.mood}</span>
            <span className="text-sm text-slate-400">Overall mood for this review</span>
          </div>
        )}

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3">
          {lifeAreas.map(area => (
            <div key={area.id} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700">
              <span>{area.icon}</span>
              <p className="text-xs text-slate-400 truncate">{area.name}</p>
              <p className="text-lg font-bold" style={{ color: area.color }}>{selectedReview.scores[area.id]}</p>
            </div>
          ))}
        </div>

        {/* Photos */}
        {selectedReview.photos && selectedReview.photos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Photos</h3>
            <div className="flex gap-3 flex-wrap">
              {selectedReview.photos.map((photo, idx) => (
                <button key={idx} onClick={() => setLightboxPhoto(photo)}
                  className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition-colors">
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Journal Entry */}
        {selectedReview.journalEntry && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Journal Entry</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedReview.journalEntry}</p>
          </div>
        )}

        {/* Insights */}
        {selectedReview.insights && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Insights</h3>
            <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-xl p-5 text-center">
              <p className="text-lg font-semibold text-slate-100 leading-relaxed italic">"{selectedReview.insights.headline}"</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Priority Focus Area</h4>
              <p className="text-slate-200 font-medium">{selectedReview.insights.focus_area}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Score Summary</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{selectedReview.insights.score_summary}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'Strengths', items: selectedReview.insights.strengths, color: 'emerald' },
                { title: 'Concerns', items: selectedReview.insights.weaknesses, color: 'red' },
                { title: 'Improvements', items: selectedReview.insights.improvements, color: 'blue' }
              ].map(sec => (
                <div key={sec.title} className={`bg-${sec.color}-500/5 border border-${sec.color}-500/20 rounded-xl p-4`}>
                  <h4 className={`text-xs font-semibold text-${sec.color}-400 uppercase tracking-wider mb-2`}>{sec.title}</h4>
                  <ul className="space-y-1.5">
                    {sec.items?.map((item, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className={`text-${sec.color}-400 mt-0.5`}>•</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answers */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Reflection Answers</h3>
          {lifeAreas.map(area => {
            const areaAnswers = selectedReview.answers[area.id] || [];
            const areaPrompts = prompts[area.id]?.[selectedReview.reviewType] || [];
            const hasAnswers = areaAnswers.some(a => a && a.trim());
            if (!hasAnswers) return null;
            return (
              <div key={area.id} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
                  <span>{area.icon}</span> {area.name}
                  <span className="ml-auto text-lg font-bold" style={{ color: area.color }}>{selectedReview.scores[area.id]}/10</span>
                </h3>
                <div className="space-y-3">
                  {areaPrompts.map((prompt, idx) => (
                    areaAnswers[idx] && areaAnswers[idx].trim() && (
                      <div key={idx}>
                        <p className="text-xs text-slate-400 mb-1">{prompt}</p>
                        <p className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3">{areaAnswers[idx]}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox */}
        {lightboxPhoto && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}>
            <img src={lightboxPhoto} alt="Full size" className="max-w-full max-h-full rounded-2xl" />
            <button className="absolute top-6 right-6 text-white text-2xl">✕</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Review History</h1>
        <button onClick={() => navigate('/review')}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm hover:bg-indigo-400 transition-all font-medium">
          + New Review
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'weekly', 'monthly', 'quarterly'].map(f => (
          <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${filter === f ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-300'}`}>
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
              <button key={review.id} onClick={() => setSelectedReview(review)}
                className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-xl p-4
                  hover:border-slate-600 hover:bg-slate-800/70 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[review.reviewType]}`}>
                        {review.reviewType}
                      </span>
                      {review.mood && <span className="text-sm">{review.mood}</span>}
                    </div>
                    <p className="text-slate-300 font-medium mt-2">{formatDate(review.createdAt || review.date)}</p>
                    {review.insights?.headline && (
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-md">"{review.insights.headline}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-200">{avgScore.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">avg score</p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  {lifeAreas.map(area => (
                    <div key={area.id} title={`${area.name}: ${review.scores[area.id]}`}
                      className="w-6 h-1.5 rounded-full"
                      style={{ backgroundColor: area.color, opacity: (review.scores[area.id] || 5) / 10 }} />
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
