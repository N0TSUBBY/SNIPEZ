'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LogIn, UserPlus, User } from 'lucide-react';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'choose' | 'login' | 'signup'>('choose');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-xl p-6 rounded-2xl bg-[rgba(8,10,20,0.85)] border border-slate-800/40 backdrop-blur-md">
        {mode === 'choose' && (
          <div>
            <h2 className="text-2xl font-bold">Welcome to SNIPEZ</h2>
            <p className="mt-2 text-slate-300">Sign in to sync your progress or continue as a guest to try the core features instantly.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={() => setMode('login')} className="flex items-center gap-2 justify-center px-4 py-3 bg-[#00aaff] rounded text-black">
                <LogIn className="w-4 h-4" /> Log in
              </button>
              <button onClick={() => setMode('signup')} className="flex items-center gap-2 justify-center px-4 py-3 bg-[#ff2b4a] rounded text-white">
                <UserPlus className="w-4 h-4" /> Sign up
              </button>
              <Link href="/notes-ai" className="flex items-center gap-2 justify-center px-4 py-3 border border-slate-700 rounded text-slate-100">
                <User className="w-4 h-4" /> Continue as guest
              </Link>
            </div>

            <div className="mt-4 text-sm text-slate-500">You can always create an account later to save your notes and flashcards.</div>
          </div>
        )}

        {mode === 'login' && (
          <div>
            <h3 className="text-xl font-semibold">Log in</h3>
            <p className="mt-2 text-slate-400">Use your email and password to sign in.</p>
            <div className="mt-4 space-y-3">
              <Link href="/login" className="block px-4 py-2 bg-slate-900/30 rounded">Open login page</Link>
            </div>
            <div className="mt-4">
              <button onClick={() => setMode('choose')} className="text-sm underline">Back</button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <h3 className="text-xl font-semibold">Create account</h3>
            <p className="mt-2 text-slate-400">Create an account to keep your progress and access across devices.</p>
            <div className="mt-4">
              <Link href="/sign-up" className="block px-4 py-2 bg-[#00aaff] rounded text-black">Open sign-up page</Link>
            </div>
            <div className="mt-4">
              <button onClick={() => setMode('choose')} className="text-sm underline">Back</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
