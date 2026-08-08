import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, question, expectedAnswer, studentAnswer, quizSessionId } = body as any;

    if (!userId || !question || !expectedAnswer || !studentAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiUrl = process.env.GEMINI_API_URL || process.env.GENERATIVE_API_URL;

    if (!geminiKey || !geminiUrl) {
      return NextResponse.json({ error: 'AI integration not configured. Please set GEMINI_API_KEY and GEMINI_API_URL in environment.' }, { status: 500 });
    }

    const supabaseServerClient = getSupabaseServerClient();

    const prompt = `You are an expert GCSE examiner. Grade the student's ANSWER against the EXPECTED ANSWER.\nReturn strictly parsable JSON:{\n  "score": number,\n  "maxScore": 5,\n  "feedback": "Detailed marking feedback and model answer.",\n  "hints": ["First hint", "Second hint - more revealing"]\n}\n\nQUESTION:\n${question}\n\nEXPECTED_ANSWER:\n${expectedAnswer}\n\nSTUDENT_ANSWER:\n${studentAnswer}`;

    const model = 'gemini-2.5-flash';

    const resp = await fetch(`${geminiUrl}/v1/models/${model}:generate`, {
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

    try {
      await supabaseServerClient.from('quiz_responses').insert({
        quiz_session_id: quizSessionId ?? null,
        user_id: userId,
        question,
        expected_answer: expectedAnswer,
        student_answer: studentAnswer,
        score,
        max_score: maxScore,
        feedback,
        hints_used: hints,
      });
    } catch (e) {
      console.warn('Failed to insert quiz response', e);
    }

    return NextResponse.json({ score, maxScore, feedback, hints });
  } catch (err) {
    console.error('grade-answer error', err);
    return NextResponse.json({ error: 'Internal error', details: String(err) }, { status: 500 });
  }
}
