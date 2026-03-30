import { useState } from 'react';

export default function AreaReview({ area, score, answers, prompts, onScoreChange, onAnswerChange }) {
  const getScoreColor = (val) => {
    if (val <= 3) return 'from-red-500 to-red-600';
    if (val <= 5) return 'from-amber-500 to-orange-500';
    if (val <= 7) return 'from-yellow-400 to-emerald-500';
    return 'from-emerald-500 to-teal-500';
  };

  const getScoreLabel = (val) => {
    if (val <= 2) return 'Needs Work';
    if (val <= 4) return 'Below Average';
    if (val <= 6) return 'Average';
    if (val <= 8) return 'Good';
    return 'Excellent';
  };

  return (
    <div className="space-y-6">
      {/* Area Header */}
      <div className="text-center">
        <span className="text-4xl">{area.icon}</span>
        <h3 className="text-xl font-bold text-slate-100 mt-2">{area.name}</h3>
        <p className="text-sm text-slate-400">{area.description}</p>
      </div>

      {/* Score Slider */}
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-300">Your Score</label>
          <div className="flex items-center gap-2">
            <span className={`
              text-3xl font-bold bg-gradient-to-r ${getScoreColor(score)} 
              bg-clip-text text-transparent
            `}>
              {score}
            </span>
            <span className="text-slate-500 text-sm">/10</span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={score}
          onChange={(e) => onScoreChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, 
              ${score <= 3 ? '#ef4444' : score <= 5 ? '#f59e0b' : score <= 7 ? '#10b981' : '#14b8a6'} 
              ${(score - 1) * 11.11}%, 
              #334155 ${(score - 1) * 11.11}%)`
          }}
          id={`score-slider-${area.id}`}
        />

        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">1</span>
          <span className={`text-xs font-medium bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
            {getScoreLabel(score)}
          </span>
          <span className="text-xs text-slate-500">10</span>
        </div>
      </div>

      {/* Reflection Prompts */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Reflection Prompts
        </h4>
        {prompts.map((prompt, idx) => (
          <div key={idx} className="group">
            <label className="block text-sm text-slate-300 mb-2 leading-relaxed">
              <span className="text-indigo-400 font-medium mr-1">{idx + 1}.</span>
              {prompt}
            </label>
            <textarea
              id={`answer-${area.id}-${idx}`}
              value={answers[idx] || ''}
              onChange={(e) => onAnswerChange(idx, e.target.value)}
              rows={3}
              placeholder="Take your time to reflect..."
              className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 
                text-slate-200 placeholder-slate-600 text-sm leading-relaxed
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                transition-all duration-200 resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
