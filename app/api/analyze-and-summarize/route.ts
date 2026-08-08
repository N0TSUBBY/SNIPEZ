// app/api/analyze-and-summarize/route.ts
// Next.js App Router API route (POST).
// Accepts JSON body { text?: string, imageBase64?: string, filename?: string, userId?: string }
// - If imageBase64 is provided: stores the image in Supabase Storage (uploads bucket) and uses that URL
// - Calls Gemini (gemini-2.5-flash) to generate structured output: summary bullets, flashcards array, quiz questions
// - Returns structured JSON: { summary: string[], flashcards: Array<{front,back}>, quizzes: Array<{question,hint,answer}> }

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

// NOTE: The Gemini client code below uses a generic fetch wrapper in case you prefer direct REST.
// Replace with your official SDK usage as needed.

type Flashcard = { front: string; back: string };
type QuizQ = { question: string; hint?: string; model_answer: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, imageBase64, filename = `upload-${Date.now()}.png`, userId } = body;

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

      // Create signed URL valid for 1 hour
      const { data: signed, error: signedError } = await supabaseServerClient.storage
        .from('uploads')
        .createSignedUrl((uploadData as any).path, 60 * 60);

      if (signedError) {
        console.warn('Signed URL error', signedError);
      } else {
        uploadedUrl = signed.signedUrl;
      }

      // Insert upload metadata row
      await supabaseServerClient.from('uploads').insert({
        user_id: userId,
        bucket: 'uploads',
        path,
        url: uploadedUrl,
        content_type: 'image/png',
      });
    }

    // Build prompt for Gemini
    const promptParts: string[] = [];
    if (text) {
      promptParts.push(`SOURCE_TEXT:\n${text}`);
    }
    if (uploadedUrl) {
      promptParts.push(`IMAGE_URL:\n${uploadedUrl}`);
    }

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
    if (!geminiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    // Replace this endpoint with your configured Gemini/Generative API endpoint or SDK call
    const model = 'gemini-2.5-flash';

    const resp = await fetch(`https://api.generativeai.example/v1/models/${model}:generate`, {
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
      return NextResponse.json({
        error: 'Failed to parse model output as JSON',
        raw: modelText,
      }, { status: 500 });
    }

    const summary: string[] = parsed.summary ?? [];
    const flashcards: Flashcard[] = parsed.flashcards ?? [];
    const quizzes: QuizQ[] = parsed.quizzes ?? [];

    // Store the note
    await supabaseServerClient.from('notes').insert({
      user_id: userId,
      title: `Auto summary ${new Date().toISOString()}`,
      summary_text: summary.join('\n'),
      extracted_text: text ?? null,
      visual_svg_url: null,
    });

    const deck = await supabaseServerClient.from('decks').insert({
      user_id: userId,
      title: `Auto Deck ${new Date().toISOString()}`,
      description: 'Auto-generated by Gemini summarizer',
    }).select('id').single();

    if (!deck.error) {
      const deckId = (deck.data as any).id;
      const cardRows = flashcards.map((c: Flashcard) => ({
        deck_id: deckId,
        user_id: userId,
        front: c.front,
        back: c.back,
      }));
      if (cardRows.length) {
        await supabaseServerClient.from('flashcards').insert(cardRows);
      }
    }

    return NextResponse.json({ summary, flashcards, quizzes }, { status: 200 });
  } catch (err) {
    console.error('analyze-and-summarize error', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
