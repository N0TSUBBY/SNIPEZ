'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-slate-300">Welcome to SNIPEZ — your revision dashboard. Use the links below to get started.</p>

      <div className="mt-6 space-x-3">
        <Link href="/study" className="inline-block px-4 py-2 bg-[#00aaff] rounded text-black">Start Study</Link>
        <Link href="/past-papers" className="inline-block px-4 py-2 bg-[#ff2b4a] rounded text-white">Past Papers</Link>
        <Link href="/notes-ai" className="inline-block px-4 py-2 border border-slate-700 rounded text-slate-100">AI Notes</Link>
      </div>
    </div>
  );
}
