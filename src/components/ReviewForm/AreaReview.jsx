import { useState } from 'react';

// Example placeholder answers for each prompt position, by area
const examplePlaceholders = {
  'personal-development': [
    'e.g., I read 50 pages of Atomic Habits and practiced public speaking twice this week.',
    'e.g., I struggled to wake up early consistently — hit snooze 4 out of 7 days.',
    'e.g., I attended a UX design workshop and took detailed notes to apply at work.',
    'e.g., I journaled daily for 15 minutes, which helped me process my thoughts better.',
    'e.g., I want to complete 2 online courses and start a 30-day writing challenge.',
    'e.g., 7/10 — Good progress on reading, but fell short on exercise consistency.'
  ],
  'finance': [
    'e.g., I saved 20% of my income and paid off a $500 credit card balance.',
    'e.g., I overspent on dining out — went $150 over my restaurant budget.',
    'e.g., I opened a high-yield savings account and set up automatic transfers.',
    'e.g., I reviewed my subscriptions and canceled 3 services I wasn\'t using.',
    'e.g., I want to build a 3-month emergency fund and start investing $100/month.',
    'e.g., 6/10 — Saving is improving but spending still needs better discipline.'
  ],
  'career': [
    'e.g., I completed the Q2 project ahead of schedule and received positive feedback.',
    'e.g., I felt stuck on a technical problem for 3 days — need to ask for help sooner.',
    'e.g., I had a good 1:1 with my manager about promotion criteria.',
    'e.g., I connected with 2 people in my industry on LinkedIn and had coffee chats.',
    'e.g., I want to lead a team project next quarter and improve my SQL skills.',
    'e.g., 7/10 — Solid output, but I need to be more visible in leadership meetings.'
  ],
  'health': [
    'e.g., I worked out 4 times this week — ran 3K twice and did strength training.',
    'e.g., My sleep has been inconsistent — averaging 5.5 hours on weeknights.',
    'e.g., I meal-prepped lunches for the week and cut out sugary snacks.',
    'e.g., I started a 10-minute morning stretch routine and it helps my back pain.',
    'e.g., I want to run a 5K, sleep 7+ hours nightly, and drink 2L water daily.',
    'e.g., 5/10 — Exercise is good but sleep and hydration need serious improvement.'
  ],
  'relationships': [
    'e.g., I had a meaningful catch-up call with an old friend I hadn\'t spoken to in months.',
    'e.g., I neglected reaching out to friends — been too focused on work.',
    'e.g., I planned a surprise dinner for my partner and it went really well.',
    'e.g., I need to set better boundaries with a colleague who drains my energy.',
    'e.g., I want to schedule monthly dinners with close friends and call family weekly.',
    'e.g., 6/10 — Romantic relationship is strong, but friendships need more attention.'
  ],
  'business': [
    'e.g., I launched my newsletter and got 45 subscribers in the first week.',
    'e.g., I procrastinated on building the MVP — only did design, no coding.',
    'e.g., I validated my idea with 5 potential customers and got useful feedback.',
    'e.g., Revenue from my side project hit $200 this month — up 30% from last month.',
    'e.g., I want to ship V1 of my app and get 10 paying customers this quarter.',
    'e.g., 4/10 — Good ideas but execution is slow. Need to block dedicated time.'
  ],
  'spiritual': [
    'e.g., I meditated for 10 minutes daily and felt noticeably calmer at work.',
    'e.g., I feel disconnected from my sense of purpose — going through the motions.',
    'e.g., I attended a weekend retreat that helped me reconnect with my values.',
    'e.g., Gratitude journaling at night has shifted my mindset in a positive way.',
    'e.g., I want to establish a morning prayer/meditation routine and read more philosophy.',
    'e.g., 5/10 — Some good moments of clarity, but not consistent enough.'
  ],
  'environment': [
    'e.g., I decluttered my desk and organized my digital files — felt much more focused.',
    'e.g., My apartment is messy — I haven\'t done a deep clean in weeks.',
    'e.g., I set up a cozy reading corner and it made my evenings more enjoyable.',
    'e.g., My commute is draining — 1.5 hours each way. Exploring remote work options.',
    'e.g., I want to redecorate my workspace, establish a cleaning schedule, and add plants.',
    'e.g., 6/10 — Work setup is great, but living space needs attention.'
  ],
  'family': [
    'e.g., I spent quality time with my kids at the park every Saturday this month.',
    'e.g., I missed my sister\'s call twice — need to be more present for family.',
    'e.g., We had a productive family meeting about our vacation plans.',
    'e.g., I contributed to a shared family savings goal for our parents\' anniversary.',
    'e.g., I want to have weekly family dinners and plan a group trip this quarter.',
    'e.g., 7/10 — Family time has been good, but communication with extended family could improve.'
  ]
};

// Default placeholders for areas not specifically covered
const defaultPlaceholders = [
  'e.g., Describe what went well and any specific wins you had...',
  'e.g., What challenges did you face and how did you handle them?',
  'e.g., What specific actions or habits contributed to your progress?',
  'e.g., Reflect on what you learned and how you can apply it going forward...',
  'e.g., What concrete goals or changes do you want to pursue next?',
  'e.g., Give yourself an honest assessment and note areas for growth...'
];

export function getExamplePlaceholder(areaId, promptIndex) {
  const areaExamples = examplePlaceholders[areaId] || defaultPlaceholders;
  return areaExamples[promptIndex] || defaultPlaceholders[promptIndex] || 'Share your thoughts...';
}

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
              placeholder={getExamplePlaceholder(area.id, idx)}
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
