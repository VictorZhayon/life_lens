import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewTypeSelect from './ReviewTypeSelect';
import AreaReview from './AreaReview';
import PhotoUpload from './PhotoUpload';
import { lifeAreas } from '../../data/lifeAreas';
import prompts from '../../data/prompts';
import { useReviews } from '../../hooks/useReviews';
import { useCustomTemplates } from '../../hooks/useCustomTemplates';
import { getPrimaryReviewType } from '../../utils/dateHelpers';

const MOODS = [
  { value: '😞', label: 'Rough' },
  { value: '😕', label: 'Tough' },
  { value: '😐', label: 'Okay' },
  { value: '🙂', label: 'Good' },
  { value: '😄', label: 'Great' }
];

export default function ReviewForm() {
  const navigate = useNavigate();
  const { saveReview, saveDraft, getDraft, clearDraft } = useReviews();
  const { getCustomPrompts } = useCustomTemplates();

  // Steps: 0 = type select, 1-9 = areas, 10 = mood/journal/photos, 11 = confirm
  const [step, setStep] = useState(0);
  const [reviewType, setReviewType] = useState('');
  const [scores, setScores] = useState({});
  const [answers, setAnswers] = useState({});
  const [mood, setMood] = useState('');
  const [journalEntry, setJournalEntry] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      setStep(draft.step || 0);
      setReviewType(draft.reviewType || '');
      setScores(draft.scores || {});
      setAnswers(draft.answers || {});
      setMood(draft.mood || '');
      setJournalEntry(draft.journalEntry || '');
      setPhotos(draft.photos || []);
    } else {
      const suggested = getPrimaryReviewType();
      if (suggested) setReviewType(suggested);
    }
  }, []);

  // Autosave draft on change
  useEffect(() => {
    if (reviewType || Object.keys(scores).length > 0) {
      saveDraft({ step, reviewType, scores, answers, mood, journalEntry, photos });
    }
  }, [step, reviewType, scores, answers, mood, journalEntry, photos]);

  const handleTypeSelect = (type) => {
    setReviewType(type);
    setStep(1);
    const initialScores = {};
    const initialAnswers = {};
    lifeAreas.forEach(area => {
      initialScores[area.id] = scores[area.id] || 5;
      initialAnswers[area.id] = answers[area.id] || Array(6).fill('');
    });
    setScores(initialScores);
    setAnswers(initialAnswers);
  };

  const handleScoreChange = (areaId, score) => {
    setScores(prev => ({ ...prev, [areaId]: score }));
  };

  const handleAnswerChange = (areaId, promptIdx, value) => {
    setAnswers(prev => ({
      ...prev,
      [areaId]: prev[areaId].map((a, i) => i === promptIdx ? value : a)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const review = await saveReview({
        reviewType, scores, answers,
        mood: mood || null,
        journalEntry: journalEntry || null,
        photos: photos || [],
        date: new Date().toISOString()
      });
      clearDraft();
      navigate(`/insights/${review.id}`);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setIsSubmitting(false);
    }
  };

  const currentArea = step >= 1 && step <= 9 ? lifeAreas[step - 1] : null;
  const totalSteps = 12; // type + 9 areas + mood/journal + confirm
  const progress = (step / (totalSteps - 1)) * 100;

  // Get prompts — custom templates override defaults
  const getPromptsForArea = (area) => {
    if (!area || !reviewType) return [];
    const custom = getCustomPrompts(area.id, reviewType);
    if (custom) return custom;
    return prompts[area.id]?.[reviewType] || [];
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">
              {step <= 9 ? `Area ${step} of 9` : step === 10 ? 'Mood & Journal' : 'Review Summary'}
            </span>
            <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="animate-fadeIn">
        {step === 0 && (
          <ReviewTypeSelect onSelect={handleTypeSelect} selectedType={reviewType} />
        )}

        {currentArea && (
          <AreaReview
            area={currentArea}
            score={scores[currentArea.id] || 5}
            answers={answers[currentArea.id] || Array(6).fill('')}
            prompts={getPromptsForArea(currentArea)}
            onScoreChange={(score) => handleScoreChange(currentArea.id, score)}
            onAnswerChange={(idx, val) => handleAnswerChange(currentArea.id, idx, val)}
          />
        )}

        {/* Step 10: Mood, Journal & Photos */}
        {step === 10 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100">Reflect & Capture</h2>
              <p className="text-slate-400 mt-1">How are you feeling? Add a journal entry or photos.</p>
            </div>

            {/* Mood Selector */}
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-4">Overall Mood</label>
              <div className="flex justify-center gap-3">
                {MOODS.map(m => (
                  <button key={m.value} type="button" onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all hover:scale-105
                      ${mood === m.value
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-700 hover:border-slate-600'}`}>
                    <span className="text-3xl">{m.value}</span>
                    <span className="text-[10px] text-slate-400">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Entry */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Journal Entry</label>
              <textarea
                id="journal-entry"
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                rows={5}
                placeholder="What's on your mind? Free-form reflections, gratitude, or anything you want to capture..."
                className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3
                  text-slate-200 placeholder-slate-600 text-sm leading-relaxed
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                  transition-all duration-200 resize-none"
              />
            </div>

            {/* Photo Upload */}
            <PhotoUpload photos={photos} onChange={setPhotos} />
          </div>
        )}

        {/* Step 11: Confirm */}
        {step === 11 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-slate-100">Ready to Submit?</h2>
            <p className="text-slate-400">
              You've completed your {reviewType} review across all 9 life areas.
            </p>

            {/* Score Summary Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {lifeAreas.map(area => (
                <div key={area.id} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                  <span className="text-lg">{area.icon}</span>
                  <p className="text-xs text-slate-400 mt-1 truncate">{area.name}</p>
                  <p className="text-xl font-bold text-slate-100">{scores[area.id]}</p>
                </div>
              ))}
            </div>

            {/* Mood & Journal Preview */}
            {(mood || journalEntry) && (
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700 text-left max-w-md mx-auto">
                {mood && <p className="text-lg mb-1">Mood: {mood}</p>}
                {journalEntry && <p className="text-sm text-slate-400 truncate">{journalEntry}</p>}
                {photos.length > 0 && <p className="text-xs text-slate-500 mt-1">📷 {photos.length} photo(s) attached</p>}
              </div>
            )}

            <button
              id="submit-review-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white
                font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30
                transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Get AI Insights'}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step > 0 && (
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
          <button
            id="review-back-btn"
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 text-slate-400 hover:text-slate-200
              border border-slate-700 rounded-xl hover:border-slate-600 transition-all duration-200"
          >
            ← Back
          </button>
          {step < 11 && (
            <button
              id="review-next-btn"
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl
                hover:bg-indigo-400 transition-all duration-200 font-medium"
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
