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

export async function generateInsights(scores, answers, reviewType) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('Please set your Gemini API key in the .env file (VITE_GEMINI_API_KEY)');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const areaNames = {};
  lifeAreas.forEach(a => { areaNames[a.id] = a.name; });

  // Build structured context
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

  const userPrompt = `Review Type: ${reviewType.toUpperCase()}

SCORES:
${scoresSummary}

REFLECTION ANSWERS:
${answersSummary}

Please analyze this review and provide your insights as JSON.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: SYSTEM_PROMPT
    });

    const responseText = result.response.text().trim();

    // Try to extract JSON from the response
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const insights = JSON.parse(jsonStr);

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

export default generateInsights;
