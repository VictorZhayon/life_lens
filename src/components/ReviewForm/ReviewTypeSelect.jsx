import { useState } from 'react';
import { reviewTypes } from '../../data/lifeAreas';
import { getPrimaryReviewType } from '../../utils/dateHelpers';

export default function ReviewTypeSelect({ onSelect, selectedType }) {
  const suggestedType = getPrimaryReviewType();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-100">Choose Your Review Type</h2>
        <p className="text-slate-400 mt-2">Select the review period you'd like to reflect on</p>
      </div>

      {suggestedType && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <p className="text-emerald-400 text-sm font-medium">
            Today is a {suggestedType} review day!
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {reviewTypes.map(type => {
          const isSelected = selectedType === type.id;
          const isSuggested = suggestedType === type.id;

          return (
            <button
              key={type.id}
              id={`review-type-${type.id}`}
              onClick={() => onSelect(type.id)}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all duration-300
                hover:scale-[1.02] hover:shadow-lg
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-indigo-500/20 shadow-lg'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }
              `}
            >
              {isSuggested && !isSelected && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Suggested
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-100">{type.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{type.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
