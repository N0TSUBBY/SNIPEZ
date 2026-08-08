// app/api/grade-answer/route.ts
// POST { userId, question, expectedAnswer, studentAnswer }
// Returns structured grading: { score: number, maxScore: number, feedback: string, hints: string[] }

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServerClient } from '../../../lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, question, expectedAnswer, studentAnswer, quizSessionId } = body;

    if (!userId || !question || !expectedAnswer || !studentAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    // Build evaluation prompt tailored for GCSE marking schemes
    const prompt = `
You are an expert GCSE examiner. Grade the student's ANSWER against the EXPECTED ANSWER.
Return strictly parsable JSON:
{
  "score": number,            // 0..maxScore (use maxScore 5 by default)
  "maxScore": 5,
  "feedback": "Detailed marking feedback and model answer.",
  "hints": ["First hint", "Second hint - more revealing"]
}

QUESTION:
${question}

EXPECTED_ANSWER:
${expectedAnswer}

STUDENT_ANSWER:
${studentAnswer}

Mark strictly and clearly, point out missing key terms and give up to 3 hints ordered from least revealing to most revealing.
`;

    // Call Gemini (REST example). Replace with official SDK usage if applicable.
    const model = 'gemini-2.5-flash';

    const resp = await fetch(`https://api.generativeai.example/v1/models/${model}:generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${geminiKey}`,
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.0,
        max_output_tokens: 400,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Gemini grading error', text);
      return NextResponse.json({ error: 'Grading API error', details: text }, { status: 500 });
    }

    const apiResult = await resp.json();

    // Heuristic to extract text
    let modelText = '';
    if (apiResult.output?.[0]?.content?.[0]?.text) {
      modelText = apiResult.output[0].content[0].text;
    } else if (Array.isArray(apiResult.candidates) && apiResult.candidates[0]?.content) {
      modelText = apiResult.candidates[0].content;
    } else if (typeof apiResult?.text === 'string') {
      modelText = apiResult.text;
    } else {
      modelText = JSON.stringify(apiResult);
    }

    // Extract JSON block
    const jsonMatch = modelText.match(/\{[\s\S]*\}/);
    let parsed: any = null;
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse grading JSON', e);
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: 'Failed to parse grader output', raw: modelText }, { status: 500 });
    }

    const score = parsed.score ?? 0;
    const maxScore = parsed.maxScore ?? 5;
    const feedback = parsed.feedback ?? '';
    const hints = parsed.hints ?? [];

    // Persist response to DB for analytics
    await supabaseServerClient.from('quiz_responses').insert({
      quiz_session_id: quizSessionId ?? null,
      user_id: userId,
      question_text: question,
      expected_answer: expectedAnswer,
      user_answer: studentAnswer,
      ai_score: score,
      hints_used: 0,
      feedback: { feedback, hints },
    });

    return NextResponse.json({ score, maxScore, feedback, hints }, { status: 200 });
  } catch (err) {
    console.error('grade-answer error', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
