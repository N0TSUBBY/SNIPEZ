// app/components/MobileNav.tsx
// Bottom-style mobile nav optimized for thumb reach.

import Link from 'next/link';
import { Home, Book, Archive, Zap } from 'lucide-react';

export default function MobileNav() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(96%,420px)] bg-gradient-to-r from-[#07102a]/70 to-[#07102a]/40 backdrop-blur-lg rounded-xl px-4 py-2 flex justify-between items-center border border-slate-800/40">
      <Link href="/dashboard" className="flex flex-col items-center text-slate-200">
        <Home className="w-5 h-5" />
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/study" className="flex flex-col items-center text-slate-200">
        <Book className="w-5 h-5" />
        <span className="text-xs">Study</span>
      </Link>
      <Link href="/past-papers" className="flex flex-col items-center text-slate-200">
        <Archive className="w-5 h-5" />
        <span className="text-xs">Papers</span>
      </Link>
      <Link href="/notes-ai" className="flex flex-col items-center text-slate-200">
        <Zap className="w-5 h-5" />
        <span className="text-xs">AI</span>
      </Link>
    </div>
  );
}
