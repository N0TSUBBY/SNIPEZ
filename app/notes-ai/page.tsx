'use client';

import { useState } from 'react';

export default function NotesAIPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);

  async function submit() {
    // basic client-side call to API - requires user to be signed in
    try {
      const res = await fetch('/api/analyze-and-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: null, text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold">AI Notes & Flashcards</h1>
      <p className="mt-4 text-slate-300">Paste text or upload an image to generate summaries and flashcards.</p>

      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full mt-4 p-3 bg-slate-900 rounded" rows={6} />
      <div className="mt-3">
        <button onClick={submit} className="px-4 py-2 bg-[#00aaff] rounded">Generate</button>
      </div>

      {result && (
        <pre className="mt-4 p-3 bg-slate-800 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
