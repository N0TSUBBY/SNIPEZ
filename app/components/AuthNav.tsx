'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabase/client';
import Link from 'next/link';

export default function AuthNav() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    // Get current session
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    });

    // Listen for auth changes
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      // unsubscribe if available
      if (sub?.subscription?.unsubscribe) sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    try {
      await supabaseClient.auth.signOut();
      // reload to update UI
      window.location.href = '/';
    } catch (e) {
      console.error('Sign out error', e);
    }
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm text-slate-200 underline">Log in</Link>
        <Link href="/sign-up" className="text-sm text-[#00aaff]">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-200">{user.email}</span>
      <button onClick={signOut} className="text-sm px-3 py-1 bg-slate-800 rounded">Sign out</button>
    </div>
  );
}
