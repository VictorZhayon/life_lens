import { useNavigate } from 'react-router-dom';

export default function ReviewBanner({ triggerTypes, onDismiss }) {
  const navigate = useNavigate();

  if (!triggerTypes || triggerTypes.length === 0) return null;

  const primary = triggerTypes[0];
  const typeLabels = {
    weekly: { label: 'Weekly', message: "It's Saturday — time for your weekly pulse check!" },
    monthly: { label: 'Monthly', message: "End of the month — time to reflect on your progress!" },
    quarterly: { label: 'Quarterly', message: "Quarter's end — time for a deep strategic review!" }
  };

  const info = typeLabels[primary] || typeLabels.weekly;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
      <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-white font-semibold text-sm">{info.label} Review Due!</p>
              <p className="text-white/80 text-xs">{info.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="start-review-banner-btn"
              onClick={() => { onDismiss(); navigate('/review'); }}
              className="px-4 py-1.5 bg-white/20 backdrop-blur text-white rounded-lg text-sm
                font-medium hover:bg-white/30 transition-colors"
            >
              Start Review
            </button>
            <button
              onClick={onDismiss}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
