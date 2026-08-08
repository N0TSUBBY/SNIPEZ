// app/components/Sidebar.tsx
// Sidebar links for Desktop/iPad interactions with hover states optimized for mouse/touch.
// Uses Lucide icons and shadcn-like markup (you can replace with shadcn primitives).

import Link from 'next/link';
import { BookOpen, FileText, Layers, Cpu, Settings } from 'lucide-react';

export default function Sidebar() {
  const navClass = 'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition';
  return (
    <nav className="flex-1">
      <ul className="space-y-1">
        <li>
          <Link href="/dashboard" className={navClass}>
            <BookOpen className="w-5 h-5 text-[#00aaff]" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/study" className={navClass}>
            <FileText className="w-5 h-5 text-[#ff2b4a]" />
            <span>Study</span>
          </Link>
        </li>
        <li>
          <Link href="/past-papers" className={navClass}>
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Past Papers</span>
          </Link>
        </li>
        <li>
          <Link href="/notes-ai" className={navClass}>
            <Cpu className="w-5 h-5 text-lime-400" />
            <span>AI Notes & Flashcards</span>
          </Link>
        </li>
        <li>
          <Link href="/settings" className={navClass}>
            <Settings className="w-5 h-5 text-slate-300" />
            <span>Settings</span>
          </Link>
        </li>
      </ul>

      <div className="mt-6 pt-6 border-t border-slate-800/30 text-sm text-slate-400">
        <p className="mb-2">Study Tips</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Active recall beats passive re-reading</li>
          <li>Short, focused sessions daily</li>
          <li>Use flashcards & spaced repetition</li>
        </ul>
      </div>
    </nav>
  );
}
