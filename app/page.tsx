'use client';

import { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    // show modal on first visit
    const seen = localStorage.getItem('snipez_seen_onboard');
    if (!seen) {
      setFirstVisit(true);
      setShowModal(true);
      localStorage.setItem('snipez_seen_onboard', '1');
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#07102a] to-[#0b1536] text-slate-100 p-6">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <section className="p-8 bg-[rgba(255,255,255,0.02)] rounded-2xl backdrop-blur-sm border border-slate-800/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 relative">
                <Image src="/images/snipez-logo.png" alt="SNIPEZ" fill style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-[#00aaff] to-[#ff2b4a]">SNIPEZ</h1>
                <p className="text-slate-300 mt-1">AI-powered GCSE revision & study partner — summaries, flashcards, and smart practice.</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-slate-300">Get started quickly — either sign in, create an account, or try SNIPEZ as a guest for instant access.</p>

              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[#00aaff] rounded font-medium text-black">Get started</button>
                <Link href="/past-papers" className="px-4 py-2 border border-slate-700 rounded text-slate-100">Browse past papers</Link>
                <Link href="/notes-ai" className="px-4 py-2 bg-[#ff2b4a] rounded text-white">Try AI Notes</Link>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded">
                  <h4 className="font-semibold">Auto Flashcards</h4>
                  <p className="text-sm text-slate-400 mt-1">Turn notes or images into active recall flashcards instantly.</p>
                </div>
                <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded">
                  <h4 className="font-semibold">Smart Quizzes</h4>
                  <p className="text-sm text-slate-400 mt-1">Exam-style questions with AI marking and progressive hints.</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="p-8 bg-gradient-to-br from-[#07102a]/40 to-[#0b1536]/30 rounded-2xl border border-slate-800/30">
            <h3 className="text-xl font-semibold">Sign in and continue</h3>
            <p className="text-slate-400 mt-2">Fast flows for desktop, tablet, and mobile with a study-focused layout.</p>

            <div className="mt-6">
              <Link href="/login" className="block px-4 py-3 bg-slate-900/40 rounded text-slate-100">Log in</Link>
              <Link href="/sign-up" className="block px-4 py-3 mt-3 bg-[#00aaff] rounded text-black">Create account</Link>
              <button onClick={() => setShowModal(true)} className="mt-3 w-full px-4 py-3 border border-slate-700 rounded">Continue as guest</button>
            </div>

            <div className="mt-8 text-sm text-slate-500">
              <p>Tip: Use the AI Notes page to paste textbook text or upload an image to generate concise summaries and flashcards.</p>
            </div>
          </aside>
        </div>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </main>
  );
}
