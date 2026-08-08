// app/layout.tsx
// Main SNIPEZ app shell: dark-first, glassmorphism, responsive sidebar for desktop/ipad, bottom nav for mobile.
// Uses Tailwind CSS. Ensure tailwind.config.js is set up for dark mode and shadcn/ui integration.

import './globals.css';
import Script from 'next/script';
import Image from 'next/image';
import { ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

export const metadata = {
  title: 'SNIPEZ — AI-Powered Revision',
  description: 'SNIPEZ — AI-powered GCSE revision & study partner',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b1020] text-slate-100 antialiased">
        {/* Tailwind Play CDN fallback - loaded before React (temporary) */}
        <Script id="tailwind-config" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: "tailwind.config = { darkMode: 'class' }" }} />
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />

        <div className="min-h-screen flex">
          {/* Desktop / iPad sidebar */}
          <aside className="hidden md:flex md:w-72 xl:w-96 flex-col bg-gradient-to-b from-[#07102a]/60 via-[#0b1536]/40 to-[#07102a]/60 backdrop-blur-md border-r border-slate-800/30 p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 relative">
                <Image src="/images/snipez-logo.png" alt="SNIPEZ" fill style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#00aaff] to-[#ff2b4a]">SNIPEZ</h1>
                <p className="text-sm text-slate-300">AI-Powered Revision & Study Partner</p>
              </div>
            </div>

            <Sidebar />
          </aside>

          <main className="flex-1 flex flex-col">
            {/* Topbar for small screens */}
            <header className="md:hidden">
              <MobileNav />
            </header>

            <div className="p-4 md:p-8 flex-1">
              {/* Content */}
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
