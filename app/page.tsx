// app/page.tsx
// Main dashboard / study landing (server component by default). Presents quick actions: upload image/text, recent decks, upcoming reviews.

import Image from 'next/image';
import Link from 'next/link';

export default async function DashboardPage() {
  // Example: We could fetch user session and upcoming reviews server-side
  // For brevity, this is a static skeleton layout with responsive behaviours.

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 relative rounded-md overflow-hidden bg-gradient-to-br from-[#00aaff] to-[#ff2b4a] p-2">
            <Image src="/images/snipez-logo.png" alt="SNIPEZ" fill style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Welcome back — Ready to Snipe your revision?</h2>
            <p className="text-slate-400 mt-1">Pick up where you left off or ask the AI to summarize notes.</p>
          </div>
        </div>

        <div className="hidden sm:flex gap-3">
          <Link href="/notes-ai" className="px-4 py-2 rounded-md bg-gradient-to-r from-[#00aaff] to-[#ff2b4a] text-black font-semibold">AI Summarize</Link>
          <Link href="/study" className="px-4 py-2 rounded-md border border-slate-700">Go Study</Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-b from-white/3 to-white/2 rounded-xl p-6 backdrop-blur-sm border border-white/5">
          <h3 className="text-xl font-semibold mb-3">Today’s Focus</h3>
          <p className="text-slate-300">No scheduled reviews — try generating a set of flashcards from your notes.</p>

          {/* quick upload UI (not wired here) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="p-3 rounded-md bg-slate-800 hover:bg-slate-700">Upload image</button>
            <button className="p-3 rounded-md bg-slate-800 hover:bg-slate-700">Paste text</button>
          </div>
        </div>

        <aside className="bg-gradient-to-b from-white/3 to-white/2 rounded-xl p-6 border border-white/5">
          <h3 className="text-lg font-semibold mb-2">Upcoming Reviews</h3>
          <ul className="space-y-2 text-slate-300">
            <li>No items due today</li>
            <li>Tomorrow: Biology deck (12 cards)</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
