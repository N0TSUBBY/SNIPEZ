import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

// Route: POST /api/analyze-and-summarize
// Body: { text?: string, imageBase64?: string, filename?: string, userId: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, imageBase64, filename = `upload-${Date.now()}.png`, userId } = body as any;

    if (!text && !imageBase64) {
      return NextResponse.json({ error: 'Provide text or imageBase64' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseServerClient = getSupabaseServerClient();

    // If imageBase64 provided, upload to Supabase Storage
    let uploadedUrl: string | null = null;
    if (imageBase64) {
      const buffer = Buffer.from(imageBase64, 'base64');
      const path = `${userId}/${filename}`;

      const { data: uploadData, error: uploadError } = await supabaseServerClient.storage
        .from('uploads')
        .upload(path, buffer, {
          contentType: 'image/png',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: signed, error: signedError } = await supabaseServerClient.storage
        .from('uploads')
        .createSignedUrl((uploadData as any).path, 60 * 60);

      if (signedError) {
        console.warn('Signed URL error', signedError);
      } else {
        uploadedUrl = signed.signedUrl;
      }

      await supabaseServerClient.from('uploads').insert({
        user_id: userId,
        bucket: 'uploads',
        path,
        url: uploadedUrl,
        content_type: 'image/png',
      });
    }

    // Build prompt for Gemini / Generative API
    const promptParts: string[] = [];
    if (text) promptParts.push(`SOURCE_TEXT:\n${text}`);
    if (uploadedUrl) promptParts.push(`IMAGE_URL:\n${uploadedUrl}`);

    promptParts.push(
      `INSTRUCTIONS:
You are an educational assistant. Produce a concise structured JSON containing:
1) summary: 6-12 short bullet points capturing the key facts/ideas.
2) flashcards: array of up to 12 {front, back} pairs for active recall.
3) quizzes: array of up to 8 exam-style questions with fields {question, hint, model_answer}.

Respond ONLY with JSON parsable output matching:
{"summary":["..."], "flashcards":[{"front":"...","back":"..."}], "quizzes":[{"question":"...","hint":"...", "model_answer":"..."}]}

Prioritise clarity, exam-focused language, and GCSE-level phrasing.`
    );

    const finalPrompt = promptParts.join('\n\n');

    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiUrl = process.env.GEMINI_API_URL || process.env.GENERATIVE_API_URL;

    if (!geminiKey || !geminiUrl) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY or GEMINI_API_URL' }, { status: 500 });
    }

    // Call Gemini/Generative API via generic REST endpoint
    const model = 'gemini-2.5-flash';

    const resp = await fetch(`${geminiUrl}/v1/models/${model}:generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${geminiKey}`,
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        temperature: 0.2,
        max_output_tokens: 800,
        modalities: uploadedUrl ? ['text', 'image'] : ['text'],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Gemini API error', errText);
      return NextResponse.json({ error: 'Gemini API error', details: errText }, { status: 500 });
    }

    const apiResult = await resp.json();

    // Attempt to extract text output and parse JSON
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

    const firstJsonMatch = modelText.match(/\{[\s\S]*\}/);
    let parsed: any = null;
    if (firstJsonMatch) {
      try {
        parsed = JSON.parse(firstJsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse model JSON directly', e);
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: 'Failed to parse model output as JSON', raw: modelText }, { status: 500 });
    }

    const summary: string[] = parsed.summary ?? [];
    const flashcards: Array<{ front: string; back: string }> = parsed.flashcards ?? [];
    const quizzes: Array<{ question: string; hint?: string; model_answer?: string }> = parsed.quizzes ?? [];

    // Insert a note record and create flashcards + decks as needed
    const noteTitle = `AI Summary ${new Date().toISOString()}`;
    const { data: noteData, error: noteError } = await supabaseServerClient.from('notes').insert({
      user_id: userId,
      title: noteTitle,
      summary: summary.join('\n'),
      extracted_text: text ?? null,
      svg_url: null,
    }).select().single();

    if (noteError) console.warn('Failed to insert note', noteError);

    // Optionally create a deck and flashcards for the user
    let deckId: string | null = null;
    const deckTitle = `AI: ${noteTitle}`;
    const { data: existingDeck } = await supabaseServerClient.from('decks').select('id').eq('user_id', userId).eq('title', deckTitle).maybeSingle();
    if (existingDeck && (existingDeck as any).id) {
      deckId = (existingDeck as any).id;
    } else {
      const { data: deckData, error: deckError } = await supabaseServerClient.from('decks').insert({ user_id: userId, title: deckTitle, description: 'Auto-generated from AI summary' }).select().single();
      if (!deckError && deckData) deckId = (deckData as any).id;
    }

    if (deckId && flashcards.length) {
      const inserts = flashcards.map((f) => ({ deck_id: deckId, user_id: userId, front: f.front, back: f.back }));
      const { error: fcError } = await supabaseServerClient.from('flashcards').insert(inserts);
      if (fcError) console.warn('Failed to insert flashcards', fcError);
    }

    return NextResponse.json({ summary, flashcards, quizzes, note: noteData ?? null });
  } catch (err) {
    console.error('analyze-and-summarize error', err);
    return NextResponse.json({ error: 'Internal error', details: String(err) }, { status: 500 });
  }
}
