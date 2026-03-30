import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewTypeSelect from './ReviewTypeSelect';
import AreaReview from './AreaReview';
import { lifeAreas } from '../../data/lifeAreas';
import prompts from '../../data/prompts';
import { useReviews } from '../../hooks/useReviews';
import { getPrimaryReviewType } from '../../utils/dateHelpers';

export default function ReviewForm() {
  const navigate = useNavigate();
  const { saveReview, saveDraft, getDraft, clearDraft } = useReviews();

  // Steps: 0 = type select, 1-9 = areas, 10 = confirm
  const [step, setStep] = useState(0);
  const [reviewType, setReviewType] = useState('');
  const [scores, setScores] = useState({});
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      setStep(draft.step || 0);
      setReviewType(draft.reviewType || '');
      setScores(draft.scores || {});
      setAnswers(draft.answers || {});
    } else {
      const suggested = getPrimaryReviewType();
      if (suggested) setReviewType(suggested);
    }
  }, []);

  // Autosave draft on change
  useEffect(() => {
    if (reviewType || Object.keys(scores).length > 0) {
      saveDraft({ step, reviewType, scores, answers });
    }
  }, [step, reviewType, scores, answers]);

  const handleTypeSelect = (type) => {
    setReviewType(type);
    setStep(1);
    // Initialize scores and answers for all areas
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

  const handleSubmit = () => {
    setIsSubmitting(true);
    const review = saveReview({
      reviewType,
      scores,
      answers,
      date: new Date().toISOString()
    });
    clearDraft();
    navigate(`/insights/${review.id}`);
  };

  const currentArea = step >= 1 && step <= 9 ? lifeAreas[step - 1] : null;
  const totalSteps = 11; // type + 9 areas + confirm
  const progress = (step / (totalSteps - 1)) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">
              {step <= 9 ? `Area ${step} of 9` : 'Review Summary'}
            </span>
            <span className="text-xs text-slate-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="animate-fadeIn">
        {step === 0 && (
          <ReviewTypeSelect
            onSelect={handleTypeSelect}
            selectedType={reviewType}
          />
        )}

        {currentArea && (
          <AreaReview
            area={currentArea}
            score={scores[currentArea.id] || 5}
            answers={answers[currentArea.id] || Array(6).fill('')}
            prompts={prompts[currentArea.id]?.[reviewType] || []}
            onScoreChange={(score) => handleScoreChange(currentArea.id, score)}
            onAnswerChange={(idx, val) => handleAnswerChange(currentArea.id, idx, val)}
          />
        )}

        {step === 10 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-slate-100">Ready to Submit?</h2>
            <p className="text-slate-400">
              You've completed your {reviewType} review across all 9 life areas.
            </p>

            {/* Score Summary Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {lifeAreas.map(area => (
                <div
                  key={area.id}
                  className="bg-slate-800/60 rounded-xl p-3 border border-slate-700"
                >
                  <span className="text-lg">{area.icon}</span>
                  <p className="text-xs text-slate-400 mt-1 truncate">{area.name}</p>
                  <p className="text-xl font-bold text-slate-100">{scores[area.id]}</p>
                </div>
              ))}
            </div>

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
              border border-slate-700 rounded-xl hover:border-slate-600
              transition-all duration-200"
          >
            ← Back
          </button>

          {step < 10 && (
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
