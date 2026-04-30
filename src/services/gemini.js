import { GoogleGenerativeAI } from '@google/generative-ai';
import { lifeAreas } from '../data/lifeAreas';

const SYSTEM_PROMPT = `You are LifeLens AI — a hybrid of a motivating coach, a wise mentor, and a sharp data analyst.

Your role is to analyze a user's structured life review and provide actionable insights.

Tone: Warm but direct. No fluff. Be encouraging where deserved, honest where needed.

You will receive:
- Scores (1-10) for 9 life areas
- Answers to 6 reflection prompts per area (54 total)
- The review type (weekly/monthly/quarterly)

Respond ONLY with valid JSON in this exact format:
{
  "strengths": ["top 3 strengths observed - be specific and reference their answers"],
  "weaknesses": ["top 3 areas of concern - be specific and actionable"],
  "improvements": ["top 3 concrete, actionable suggestions for the next period"],
  "headline": "One sharp sentence summarizing this review period",
  "focus_area": "The single life area needing the most attention next period",
  "score_summary": "Brief narrative (2-3 sentences) of score distribution and patterns"
}

Do not include any text outside the JSON. Do not wrap in markdown code blocks.`;

const ACTION_PLAN_PROMPT = `You are LifeLens AI — an action-oriented life strategist.

Based on the user's review scores, answers, and AI insights, generate a concrete, structured action plan.

The plan duration is specified by the user (7 days or 30 days).

Respond ONLY with valid JSON in this exact format:
{
  "title": "A motivating title for this action plan",
  "duration": 7 or 30,
  "motivation": "A short motivating paragraph about why this plan matters",
  "tasks": [
    {
      "id": "task-1",
      "day": 1,
      "task": "Specific, concrete action to take",
      "area": "life-area-id this task relates to",
      "completed": false
    }
  ]
}

Rules:
- For 7-day plans: create 10-14 tasks spread across the 7 days
- For 30-day plans: create 20-30 tasks spread across the 30 days
- Tasks should be specific and actionable (not vague like "work on health")
- Focus most tasks on the weakest areas, but include maintenance tasks for strengths
- Each task should take 15-60 minutes
- Use the area IDs: personal-development, finance, career, health, relationships, business, spiritual, environment, family

Do not include any text outside the JSON. Do not wrap in markdown code blocks.`;

function getGenAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('Please set your Gemini API key in the .env file (VITE_GEMINI_API_KEY)');
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildReviewContext(scores, answers, reviewType) {
  const areaNames = {};
  lifeAreas.forEach(a => { areaNames[a.id] = a.name; });

  const scoresSummary = Object.entries(scores)
    .map(([areaId, score]) => `${areaNames[areaId] || areaId}: ${score}/10`)
    .join('\n');

  const answersSummary = Object.entries(answers)
    .map(([areaId, areaAnswers]) => {
      const name = areaNames[areaId] || areaId;
      const formattedAnswers = areaAnswers
        .map((a, i) => `  Q${i + 1}: ${a || '(not answered)'}`)
        .join('\n');
      return `${name}:\n${formattedAnswers}`;
    })
    .join('\n\n');

  return `Review Type: ${reviewType.toUpperCase()}

SCORES:
${scoresSummary}

REFLECTION ANSWERS:
${answersSummary}`;
}

function parseJSON(responseText) {
  let jsonStr = responseText.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }
  return JSON.parse(jsonStr);
}

export async function generateInsights(scores, answers, reviewType) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const userPrompt = buildReviewContext(scores, answers, reviewType) +
    '\n\nPlease analyze this review and provide your insights as JSON.';

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: SYSTEM_PROMPT
    });

    const insights = parseJSON(result.response.text());

    // Validate required fields
    const requiredFields = ['strengths', 'weaknesses', 'improvements', 'headline', 'focus_area', 'score_summary'];
    for (const field of requiredFields) {
      if (!insights[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return insights;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. Please try regenerating insights.');
    }
    throw error;
  }
}

export async function generateActionPlan(scores, answers, reviewType, insights, duration = 7) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const context = buildReviewContext(scores, answers, reviewType);

  const insightsSummary = insights
    ? `\n\nAI INSIGHTS SUMMARY:
Headline: ${insights.headline}
Focus Area: ${insights.focus_area}
Strengths: ${insights.strengths?.join(', ')}
Weaknesses: ${insights.weaknesses?.join(', ')}
Improvements: ${insights.improvements?.join(', ')}`
    : '';

  const userPrompt = `${context}${insightsSummary}

Please generate a ${duration}-DAY action plan as JSON.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: ACTION_PLAN_PROMPT
    });

    const plan = parseJSON(result.response.text());

    // Validate
    if (!plan.title || !plan.tasks || !Array.isArray(plan.tasks)) {
      throw new Error('Invalid action plan format');
    }

    // Ensure all tasks have completed: false
    plan.tasks = plan.tasks.map((t, i) => ({
      ...t,
      id: t.id || `task-${i + 1}`,
      completed: false
    }));

    plan.duration = duration;
    return plan;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI action plan. Please try again.');
    }
    throw error;
  }
}

export default generateInsights;
