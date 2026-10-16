# PR55 — Resume Builder and AI quality assurance

## Changes implemented
- Validate AI score as finite numeric input; clamp to 0–100 and round before display.
- Bound AI-provided labels, warnings, lists, tailored text and cover letters to reasonable lengths.
- Filter non-string items from AI skill and match-note arrays.
- Reject malformed top-level AI response objects rather than rendering invalid content.

## Manual end-to-end checks (not yet executed)
1. Resume Builder: complete six steps, add/remove experience, education, skills and projects; check preview and A4 PDF download.
2. Draft recovery: refresh while editing and confirm local draft persists. Verify save-to-account, reopen, rename and delete when signed in.
3. Tailor Resume: paste valid resume and job description; check result fit score, labels, skills, notes, copy and PDF download.
4. Upload PDF: valid text PDF, empty PDF, renamed non-PDF, oversized file and PDF with more than 30,000 extracted characters.
5. API invalid inputs: missing fields, arrays/objects in place of strings, malformed JSON, oversized inputs.
6. AI provider failure: timeout, invalid JSON, 429/5xx; verify friendly error and no raw resume text in logs.
7. Quality: compare score consistency across repeated runs; verify generated resume never invents work history, dates or qualifications.
8. Mobile: 360px width, keyboard navigation, loading indicators, error messages and long resume content.

## Release gate
A successful Vercel build does **not** prove these user workflows pass. Run the checks above on a staging deployment with test accounts and document results before public launch. Server-side AI rate limiting and Supabase live RLS testing remain unresolved.
