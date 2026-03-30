// All 162 prompts: 9 life areas × 3 review types × 6 prompts each
// Structured as { [areaId]: { weekly: [...], monthly: [...], quarterly: [...] } }

const prompts = {
  'personal-development': {
    weekly: [
      'What one skill did you actively work on this week?',
      'What did you learn that surprised or challenged you?',
      'What habit did you maintain, build, or break this week?',
      'Where did you feel most mentally sharp or in flow?',
      'What distraction cost you the most growth time?',
      'What would your future self say about how you spent this week?'
    ],
    monthly: [
      'What new capability did you develop or strengthen this month?',
      'Which learning resources (books, courses, mentors) had the most impact?',
      'What pattern do you notice in your daily habits — are they compounding or stalling?',
      'Where did you step outside your comfort zone this month?',
      'What goal did you set at the start of the month, and how close are you?',
      'If you could redesign your personal growth system right now, what would you change?'
    ],
    quarterly: [
      'How has your identity or self-concept shifted over the past 3 months?',
      'What skill or knowledge gap is holding you back from the next level?',
      'What personal development investments (time, money, energy) had the highest ROI?',
      'Are your current habits aligned with the person you want to become in 5 years?',
      'What limiting belief did you challenge or overcome this quarter?',
      'If you were coaching yourself, what bold move would you recommend for next quarter?'
    ]
  },

  'finance': {
    weekly: [
      'Did you stick to your budget this week? Where did you overspend?',
      'What was your biggest financial win this week, no matter how small?',
      'Did you make any progress toward a savings or investment goal?',
      'What unnecessary expense could you cut next week?',
      'Did you review your financial accounts or track your spending?',
      'What money mindset or belief influenced your spending decisions this week?'
    ],
    monthly: [
      'How does your actual spending compare to your planned budget this month?',
      'What progress did you make toward your savings targets?',
      'Did you explore any new income streams or investment opportunities?',
      'What financial habit served you well, and what habit hurt you?',
      'Are your recurring subscriptions and expenses still justified?',
      'What would a financially free version of you do differently next month?'
    ],
    quarterly: [
      'How has your net worth changed over the past 3 months?',
      'Are your financial goals still aligned with your life vision?',
      'What was your best and worst financial decision this quarter?',
      'How diversified are your income sources — do you need to add more?',
      'What financial education or mentorship would accelerate your progress?',
      'Where do you see yourself financially in one year if you maintain this trajectory?'
    ]
  },

  'career': {
    weekly: [
      'What was your most impactful professional accomplishment this week?',
      'Did you receive any feedback — and how did you respond to it?',
      'What skill or task pushed you professionally this week?',
      'Did you invest any time in networking or relationship-building at work?',
      'What could you have delegated or said no to?',
      'How aligned was your work this week with your long-term career goals?'
    ],
    monthly: [
      'What professional milestone or achievement are you most proud of this month?',
      'How has your role or responsibilities evolved?',
      'What relationship at work (mentor, peer, leader) grew stronger this month?',
      'Are you developing skills that increase your market value?',
      'What professional risk did you take, or wish you had taken?',
      'If your career had a scoreboard, what metrics improved this month?'
    ],
    quarterly: [
      'Are you on track to hit the career goals you set at the start of this year?',
      'Has your career vision changed — and if so, what triggered the shift?',
      'What is the single biggest bottleneck in your professional growth right now?',
      'How well do your current projects align with the role you ultimately want?',
      'What strategic career move should you make in the next 90 days?',
      'If you were hiring for your own replacement, what skill gaps would you notice?'
    ]
  },

  'health': {
    weekly: [
      'How many days did you exercise this week, and what types of activity did you do?',
      'How would you rate your sleep quality and consistency?',
      'Did you fuel your body with nutritious meals, or did stress eating take over?',
      'How is your mental health — did you take time for rest and recovery?',
      'What health-positive habit did you maintain this week?',
      'What one thing could you do next week to feel more energized?'
    ],
    monthly: [
      'What health trend do you notice — are you getting stronger or declining?',
      'Did you keep any health-related appointments or checkups?',
      'How consistent was your exercise routine this month?',
      'What emotional or mental health pattern needs attention?',
      'What did you eat or drink most often — is that sustainable and healthy?',
      'If your body could talk, what would it ask you for right now?'
    ],
    quarterly: [
      'How has your overall fitness and energy level changed in 3 months?',
      'Are your health habits setting you up for long-term vitality or slow decline?',
      'What health goal did you accomplish — or abandon — this quarter?',
      'How do your stress levels compare to the start of the quarter?',
      'What health investment (gym, therapy, supplements, coaching) was most valuable?',
      'What does your ideal healthy lifestyle look like, and how far are you from it?'
    ]
  },

  'relationships': {
    weekly: [
      'Who did you spend the most meaningful time with this week?',
      'Did you initiate any connection — a call, text, or visit — with someone you care about?',
      'Was there any conflict or tension, and how did you handle it?',
      'Who made a positive impact on your week, and did you tell them?',
      'Did you set healthy boundaries in any relationship?',
      'What would make your closest relationships stronger next week?'
    ],
    monthly: [
      'Which relationships deepened or grew this month?',
      'Did you neglect anyone important — and what will you do about it?',
      'What communication pattern (listening, asserting, avoiding) showed up most?',
      'Did you invest in any new friendships or communities?',
      'How authentically did you show up in your relationships this month?',
      'What relationship brings you energy, and which one drains you?'
    ],
    quarterly: [
      'How has your social circle evolved over the past 3 months?',
      'Are you surrounded by people who challenge and support your growth?',
      'What relationship boundary do you need to establish or reinforce?',
      'Did any relationship experience a breakthrough or a breakdown this quarter?',
      'What does your ideal social life look like — and how close are you?',
      'If your future self could give you one piece of relationship advice, what would it be?'
    ]
  },

  'business': {
    weekly: [
      'What progress did you make on your side project or business this week?',
      'Did you generate any revenue or move closer to monetization?',
      'What task or decision did you avoid — and why?',
      'Did you learn something new about your market or customers?',
      'What is the single most important thing to do next week for your project?',
      'How many hours did you dedicate, and was it enough?'
    ],
    monthly: [
      'What milestone did your business or side project hit this month?',
      'Did you validate any idea, product, or service with real users?',
      'How does your revenue or growth compare to last month?',
      'What process or system did you build to scale your work?',
      'What was the hardest decision you made in your business this month?',
      'If an investor asked for your monthly progress summary, what would you report?'
    ],
    quarterly: [
      'Is your business or project still aligned with your original vision?',
      'What was your biggest win and biggest failure this quarter?',
      'How has your competitive landscape changed — are you adapting?',
      'What strategic pivot, if any, should you consider?',
      'Are you building something sustainable, or running on adrenaline?',
      'What does success look like for this project by the end of next quarter?'
    ]
  },

  'spiritual': {
    weekly: [
      'Did you make time for meditation, prayer, or quiet reflection this week?',
      'What moment brought you the most inner peace or clarity?',
      'Did you feel aligned with your values and purpose this week?',
      'What emotion came up most — and did you process it or suppress it?',
      'Did you practice gratitude intentionally?',
      'What would bring your spirit more peace next week?'
    ],
    monthly: [
      'How has your spiritual or mindfulness practice evolved this month?',
      'What life event this month tested or strengthened your inner beliefs?',
      'Did you read, listen to, or engage with any spiritual or philosophical material?',
      'How connected do you feel to your sense of purpose right now?',
      'What emotional patterns are recurring — and what are they trying to tell you?',
      'If your inner self had a message for you, what do you think it would be?'
    ],
    quarterly: [
      'How has your relationship with yourself and your purpose changed this quarter?',
      'What spiritual or philosophical insight reshaped your thinking?',
      'Are you living in alignment with your core values — or drifting?',
      'What practices (meditation, journaling, therapy) contributed most to your inner growth?',
      'What does spiritual or inner fulfillment look like for you in the next 3 months?',
      'If you could sit with your wisest self for an hour, what would you discuss?'
    ]
  },

  'environment': {
    weekly: [
      'Is your living or working space organized and conducive to focus?',
      'Did your daily routine support your goals or work against them?',
      'What part of your environment caused you the most friction this week?',
      'Did you make any improvement to your physical space or tools?',
      'How intentional were your mornings and evenings?',
      'What lifestyle tweak would make next week noticeably better?'
    ],
    monthly: [
      'How does your daily routine look compared to the start of the month?',
      'Did you invest in upgrading your environment (workspace, home, tools)?',
      'What habit or system in your daily life is running on autopilot and needs review?',
      'Are your surroundings reflecting the life you want to live?',
      'How much time did you spend on things that don\'t align with your priorities?',
      'What one environmental change would have the biggest positive impact?'
    ],
    quarterly: [
      'How has your living and working environment evolved in 3 months?',
      'Are your routines sustainable — or are you burning out?',
      'What lifestyle decision this quarter had the biggest positive or negative impact?',
      'Does your environment inspire productivity and calm, or chaos and avoidance?',
      'What is one bold lifestyle change you could make in the next quarter?',
      'If a life designer audited your daily environment, what grade would you receive?'
    ]
  },

  'family': {
    weekly: [
      'What quality time did you spend with family this week?',
      'Did you have any meaningful conversations with a family member?',
      'Was there any family conflict — and how did you handle it?',
      'Did you contribute to a family goal or shared responsibility?',
      'What could you do next week to strengthen a family bond?',
      'How present were you during family time — fully engaged or distracted?'
    ],
    monthly: [
      'What family memory or experience stood out most this month?',
      'Did you make progress on any shared family goals (financial, travel, health)?',
      'How well did you balance personal priorities with family responsibilities?',
      'Was there a difficult family conversation you\'ve been avoiding?',
      'What family tradition or routine would you like to start or revive?',
      'How supported do you feel by your family — and how supported do they feel by you?'
    ],
    quarterly: [
      'How has your role within the family shifted over the past 3 months?',
      'What family goal did you accomplish — or fall behind on?',
      'Are you investing enough time and energy in relationships that matter most?',
      'What family challenge needs to be addressed head-on next quarter?',
      'What legacy or values are you actively passing on to your family?',
      'If your family wrote a review of you this quarter, what would they say?'
    ]
  }
};

export default prompts;
