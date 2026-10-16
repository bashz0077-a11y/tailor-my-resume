# TailorMyResume

A polished Next.js app that tailors a resume and cover letter to a job description while keeping every claim grounded in the original resume.

## What it includes

- PDF resume upload and text extraction, plus a paste-text option
- Job skill and requirement analysis
- Tailored resume summary and bullet ordering
- Ready-to-send cover letter
- Copy and PDF download actions for both documents
- Three-use browser-based free limit, ready to replace with account billing later
- Clear validation and friendly errors for missing text, invalid files, and unreadable PDFs
- Optional Gemini-powered rewriting with an honest, fact-preserving prompt
- Responsive premium UI built with Tailwind CSS

## Run locally

1. Install Node.js 20 or newer.
2. Open this project folder in a terminal.
3. Install packages:

   ```bash
   npm install
   ```

4. Create `.env.local` and set `GEMINI_API_KEY` for Gemini rewriting (optionally `GEMINI_MODEL`). Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for authenticated job features. Without a Gemini key, local tailoring is used. Do not expose server-side secrets through `NEXT_PUBLIC_` variables.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000`.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Vercel detects Next.js automatically; keep the default build settings.
4. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` for AI rewriting. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for authenticated job features. Configure Production and Preview separately; never expose service-role or Gemini keys to the browser.
5. Deploy.

## How the backend works

- `app/api/parse-resume/route.ts` validates a PDF and extracts its text on the server.
- `app/api/tailor/route.ts` validates the request. With an API key, it asks the model for structured, fact-preserving output. Without a key, it calls `lib/tailor.ts` for a lightweight local result.
- The API key is read only by the server route and is never sent to the browser.

## Important production note

The three-use limit is stored in `localStorage` and is **not** a security boundary. The public AI endpoint currently has no server-side quota or rate limit; do not enable a paid Gemini key for unrestricted public traffic until abuse protection is implemented. Users can reset browser storage, so a real paywall should later move usage tracking to authenticated server-side storage (for example, Supabase or Vercel Postgres).

## Beginner-friendly places to customise

- Brand colours and global styles: `app/globals.css` and Tailwind classes in `components/ResumeApp.tsx`
- AI behaviour and safety rules: `SCORE_PROMPT` and `GENERATE_PROMPT` in `app/api/tailor/route.ts`
- Local fallback logic: `lib/tailor.ts`
- Free usage count: `FREE_LIMIT` in `components/ResumeApp.tsx`
