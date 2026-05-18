import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'lifelens_onboarding_done';

const steps = [
  {
    icon: '🔍',
    title: 'Welcome to LifeLens',
    description: 'Your personal review & re-strategy planner. Track your growth across 9 life areas with AI-powered insights.',
    bg: 'from-indigo-500/20 to-emerald-500/20'
  },
  {
    icon: '📊',
    title: '9 Life Areas',
    description: 'Rate yourself 1-10 in Personal Development, Finance, Career, Health, Relationships, Business, Spiritual, Environment, and Family.',
    bg: 'from-blue-500/20 to-indigo-500/20',
    areas: ['🌱','💰','💼','❤️','🤝','🚀','🧘','🏡','👨‍👩‍👧‍👦']
  },
  {
    icon: '🤖',
    title: 'AI-Powered Insights',
    description: 'After each review, our AI analyzes your scores and answers to provide personalized strengths, areas of concern, and actionable improvements.',
    bg: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: '🎯',
    title: 'Track Goals & Streaks',
    description: 'Set goals with milestones, build review streaks, earn badges, compare progress, and export PDF reports. Your growth journey starts now!',
    bg: 'from-amber-500/20 to-orange-500/20'
  }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) setVisible(true);
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-fadeIn" key={step}>
        {/* Step indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300
              ${i === step ? 'w-8 bg-indigo-500' : i < step ? 'w-4 bg-indigo-500/50' : 'w-4 bg-slate-700'}`} />
          ))}
        </div>

        {/* Content */}
        <div className={`bg-gradient-to-br ${current.bg} rounded-3xl p-8 text-center space-y-4`}>
          <span className="text-6xl">{current.icon}</span>
          <h2 className="text-2xl font-bold text-slate-100">{current.title}</h2>
          <p className="text-slate-300 leading-relaxed">{current.description}</p>
          {current.areas && (
            <div className="flex justify-center gap-2 pt-2">
              {current.areas.map((a, i) => (
                <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>{a}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleComplete}
            className="flex-1 px-4 py-2.5 text-slate-400 border border-slate-700 rounded-xl hover:text-slate-300 text-sm">
            Skip
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-400">
              Next →
            </button>
          ) : (
            <button onClick={handleComplete}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:shadow-lg">
              Get Started! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
