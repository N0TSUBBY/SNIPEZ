import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// POST /api/auth/guest
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Guest creation not available: SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 501 });
    }

    // Create a guest user via Admin API if available.
    const guestEmail = `guest+${uuidv4()}@snipez.local`;
    try {
      // supabase.auth.admin.createUser typically returns { data, error }
      // Use the data shape safely so TypeScript / runtime both work.
      // @ts-ignore - admin API may not be typed in this environment
      const res = await supabase.auth.admin.createUser({
        email: guestEmail,
        password: uuidv4(),
        email_confirm: true,
      });

      // Prefer the modern shape: res.data.user
      const userObj = (res && (res as any).data && (res as any).data.user) || (res && (res as any).user) || null;

      if ((res as any).error) {
        return NextResponse.json({ error: 'Failed to create guest user', details: (res as any).error?.message ?? (res as any).error }, { status: 500 });
      }

      // Create profile record
      const userId = userObj?.id ?? null;
      if (userId) {
        await supabase.from('profiles').insert({ id: userId, email: guestEmail, display_name: 'Guest' });
      }

      return NextResponse.json({ ok: true, guest: { id: userId, email: guestEmail } });
    } catch (e) {
      return NextResponse.json({ error: 'Guest creation failed', details: String(e) }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal error', details: String(err) }, { status: 500 });
  }
}
