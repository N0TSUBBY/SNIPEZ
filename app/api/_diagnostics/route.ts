import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

export async function GET() {
  try {
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    let tablesOk = { profiles: false, notes: false };
    try {
      const supabase = getSupabaseServerClient();
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
      const { data: notes } = await supabase.from('notes').select('id').limit(1);
      tablesOk.profiles = Array.isArray(profiles);
      tablesOk.notes = Array.isArray(notes);
    } catch (e) {
      // ignore; will return false for tables
    }

    return NextResponse.json({ hasSupabaseUrl, hasSupabaseAnonKey, hasServiceRole, hasGemini, tablesOk });
  } catch (err) {
    return NextResponse.json({ error: 'Diagnostics failed', details: String(err) }, { status: 500 });
  }
}
