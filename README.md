<div align="center">

  <img src="./public/logo.png" alt="SNIPEZ Logo" width="180" />

  # 🎯 SNIPEZ

  **Precision Revision & AI-Powered Study Partner**

  [![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  <p align="center">
    A high-performance, cross-platform GCSE revision suite built to turn raw notes and textbook photos into active recall flashcards, interactive quizzes, and AI-marked exam practice.
  </p>

  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-database-setup">Database Setup</a> •
  <a href="#-deployment">Deployment</a>

</div>

---

## 🔥 Overview

**SNIPEZ** is engineered to replace passive reading with high-efficiency active recall. By leveraging **Google Gemini 2.5 Flash**, SNIPEZ automatically parses written notes or uploaded photos (textbooks, whiteboards, handwritten pages) to extract core concepts, summarize key points, generate spaced-repetition flashcards, and grade practice responses against standard GCSE mark schemes.

Designed with a dark-mode first UI using a bold **electric blue and red** theme, SNIPEZ is fully optimized for **PC, iPad, and mobile devices**.

---

## ⚡ Key Features

* **📸 Multimodal Image-to-Notes:** Upload photos of handwritten notes or exam papers to instantly generate structured summaries and flashcards.
* **🧠 Spaced Repetition Flashcards:** Smart flashcard player with card flipping, review scheduling, keyboard hotkeys on PC, and touch gestures on mobile.
* **📝 Interactive AI Practice Engine:** Practice topic questions with real-time feedback, progressive hints when you get stuck, and automated AI marking based on official mark schemes.
* **📚 GCSE Past Papers & Revision Hub:** Access organized past paper links, mark schemes, and topic guides across major exam boards (AQA, Edexcel, OCR, WJEC).
* **🔒 Secure User Authentication:** Full auth flow powered by Supabase with Row Level Security (RLS) keeping your cards, decks, and revision history private.
* **📱 Ultra-Responsive UX:** Tailored layouts for every screen size—collapsible sidebar for PC/iPad and a fluid bottom bar for mobile.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, Storage)
* **AI Engine:** [Google Gemini API](https://ai.google.dev/) (`@google/genai` SDK using `gemini-2.5-flash`)
* **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18.0 or later)
* [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
* A free [Supabase](https://supabase.com/) project
* A free [Google AI Studio](https://aistudio.google.com/) API key

### 2. Clone & Install

```bash
git clone [https://github.com/your-username/snipez.git](https://github.com/your-username/snipez.git)
cd snipez
npm install

