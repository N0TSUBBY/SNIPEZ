'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const currentUser = sessionData?.session?.user ?? null;
      if (!mounted) return;
      setUser(currentUser);
      if (!currentUser) {
        // not signed in — redirect to landing so they can sign in or guest
        router.push('/');
        return;
      }
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (!mounted) return;
      setProfile(data ?? null);
      setLoading(false);
    }
    init();
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription?.unsubscribe && sub.subscription.unsubscribe();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;

  if (!user) return null;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">Welcome back — {profile?.display_name ?? user.email}</h2>
      <p className="mt-2 text-slate-300">User ID: {user.id}</p>

      <section className="mt-6">
        <h3 className="text-lg font-semibold">Your quick actions</h3>
        <ul className="mt-3 list-disc ml-6">
          <li><a className="text-[#00aaff] underline" href="/notes-ai">Generate AI notes from uploads</a></li>
          <li><a className="text-[#00aaff] underline" href="/study">Start a study session</a></li>
          <li><a className="text-[#00aaff] underline" href="/past-papers">Review past papers</a></li>
        </ul>
      </section>
    </div>
  );
}
