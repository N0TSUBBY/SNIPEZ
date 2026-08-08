'use client';

import { useState } from 'react';
import { supabaseClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function onSignUp(e: any) {
    e.preventDefault();
    setMsg('Creating account...');
    try {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes('Invalid')) setMsg('Invalid request — check your email and password format.');
        else setMsg(`Error: ${error.message}`);
        return;
      }
      setMsg('Account created — check your email for a confirmation link.');
      router.push('/dashboard');
    } catch (e: any) {
      setMsg('Network error — cannot reach authentication server. Check environment configuration.');
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Create an account</h1>
      <form onSubmit={onSignUp} className="space-y-3">
        <input className="w-full p-2 rounded bg-slate-900" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-2 rounded bg-slate-900" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-[#00aaff] rounded">Create account</button>
      </form>
      <p className="mt-4 text-sm">{msg}</p>
    </div>
  );
}
