import { NextResponse } from "next/server";
import { localTailor } from "@/lib/tailor";
import type { TailorResult } from "@/lib/types";

export const runtime = "nodejs";
// Vercel default function timeout is too short for multiple sequential
// AI calls (scoring + generation + rescoring, possibly x3 with retries).
// This raises the ceiling so a full retry cycle can actually finish.
export const maxDuration = 60;

/* ────────────────────────────────────────────────────────────────────────
   ARCHITECTURE NOTE (read this before touching the logic below)

   The old version asked Gemini to score AND rewrite the resume in a
   single call. That meant every regeneration produced new wording,
   and scoring THAT new wording gave a different score every time -
   the score and the text were never independently comparable.

   This version splits the two concerns:

     scoreResume()    - scores a given block of resume text against the
                         job description. Nothing else. Called with
                         temperature 0, so the same text + same job
                         always produces the same score.

     generateCandidate() - takes the ORIGINAL resume (never a previous
                         AI output) and produces ONE tailored rewrite.
                         Also temperature 0.

   The POST handler below is the only place that combines them:
   it always scores the untouched original resume first (the
   "source of truth" baseline), then generates a candidate rewrite,
   scores that candidate's resume text with the exact same scorer,
   and only keeps the candidate if it scores at or above the
   original. If not, it retries (max 2 retries = 3 attempts total)
   before falling back to the best truthful candidate produced, or
   the original text itself if nothing beat it - so the user is
   never handed a worse-scoring rewrite than what they started with.
   ──────────────────────────────────────────────────────────────────────── */

const SCORE_PROMPT = (resume: string, job: string) => `You are an ethical, realistic hiring evaluator. Score how well this resume ACTUALLY matches this job description. Do not be encouraging or generous - a candidate missing core requirements should score low.

Return ONLY this JSON:
{
  "fitScore": number 0-100,
  "fitLabel": "2-4 word label, e.g. 'Strong match' / 'Reasonable match' / 'Significant gaps' / 'Poor fit for this role'",
  "fitWarning": "one direct honest sentence if fitScore < 40, otherwise null",
  "keySkills": ["skills from the resume genuinely relevant to this job"],
  "matchNotes": ["honest notes on what matches and what's missing"]
}

RESUME:
${resume}

JOB DESCRIPTION:
${job}`;

const GENERATE_PROMPT = (resume: string, job: string) => `You are an ethical career editor. Rewrite this resume to better present it for the job below, using ONLY facts already present in the resume. Never invent experience, employers, dates, education, tools, metrics, or achievements - only rephrase, reprioritize, and reorganize what's actually there. Naturally incorporate the job description's real terminology only where the resume's own content genuinely supports it. Do not keyword-stuff.

Also write a matching, honest cover letter from the same facts.

Return ONLY this JSON:
{
  "jobTitle": "the job title from the posting",
  "tailoredResume": "plain text with headings and bullets",
  "coverLetter": "plain text"
}

ORIGINAL RESUME (this is the only source of truth - do not carry over wording from any other draft):
${resume}

JOB DESCRIPTION:
${job}`;

async function callGemini(prompt: string) {
  const model = process.env.GEMINI_MODEL || "gemini-3-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        // temperature 0: deterministic output for the same input,
        // required so scoring is stable and regeneration doesn't drift.
        generationConfig: { temperature: 0, responseMimeType: "application/json" }
      })
    }
  );
  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API error:", errText);
    throw new Error("AI service error");
  }
  const payload = await response.json();
  let raw = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  raw = raw.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return JSON.parse(raw);
}

type ScoreResult = { fitScore: number; fitLabel: string; fitWarning: string | null; keySkills: string[]; matchNotes: string[] };
type GenResult = { jobTitle: string; tailoredResume: string; coverLetter: string };

async function scoreResume(resume: string, job: string): Promise<ScoreResult> {
  const r = await callGemini(SCORE_PROMPT(resume, job));
  return {
    fitScore: typeof r.fitScore === "number" ? r.fitScore : 50,
    fitLabel: r.fitLabel || "Fit unclear",
    fitWarning: r.fitScore >= 40 ? null : (r.fitWarning || null),
    keySkills: Array.isArray(r.keySkills) ? r.keySkills : [],
    matchNotes: Array.isArray(r.matchNotes) ? r.matchNotes : []
  };
}

async function generateCandidate(originalResume: string, job: string): Promise<GenResult> {
  const r = await callGemini(GENERATE_PROMPT(originalResume, job));
  return {
    jobTitle: r.jobTitle || "this role",
    tailoredResume: r.tailoredResume || originalResume,
    coverLetter: r.coverLetter || ""
  };
}

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();
    if (!resume?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: "Add both your resume and the job description." }, { status: 400 });
    if (resume.length > 30000 || jobDescription.length > 20000) return NextResponse.json({ error: "The text is too long. Please shorten it and try again." }, { status: 413 });

    if (!process.env.GEMINI_API_KEY) return NextResponse.json(localTailor(resume, jobDescription));

    // STEP 1: score the untouched original resume, IN PARALLEL with
    // generating the first candidate. These two calls don't depend on
    // each other's output, so running them together roughly halves
    // the time spent on the first attempt.
    const MAX_RETRIES = 1; // 2 attempts total - kept low to stay well
                            // inside Vercel's function time limit.
    const [originalScore, firstCandidate] = await Promise.all([
      scoreResume(resume, jobDescription),
      generateCandidate(resume, jobDescription)
    ]);

    let best: { gen: GenResult; score: ScoreResult } | null = null;
    let candidate = firstCandidate;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        // Only regenerate on retry - always from the ORIGINAL resume,
        // never from a previous candidate, so quality can't drift.
        candidate = await generateCandidate(resume, jobDescription);
      }
      const candidateScore = await scoreResume(candidate.tailoredResume, jobDescription);

      console.log(`[tailor] attempt ${attempt + 1}: candidate score ${candidateScore.fitScore} vs original ${originalScore.fitScore}`);

      if (!best || candidateScore.fitScore > best.score.fitScore) {
        best = { gen: candidate, score: candidateScore };
      }
      if (candidateScore.fitScore >= originalScore.fitScore) {
        break; // good enough - accept immediately, no need to burn more retries
      }
    }

    // If nothing beat the original, don't hand back a worse rewrite.
    // Fall back to the original resume text itself (still truthful,
    // still guaranteed to carry the original's own score).
    const finalUsesOriginal = !best || best.score.fitScore < originalScore.fitScore;
    const finalResumeText = finalUsesOriginal ? resume : best!.gen.tailoredResume;
    const finalScore = finalUsesOriginal ? originalScore : best!.score;
    const finalCoverLetter = finalUsesOriginal
      ? (best?.gen.coverLetter || "")
      : best!.gen.coverLetter;
    const finalJobTitle = best?.gen.jobTitle || "this role";

    const result: TailorResult = {
      jobTitle: finalJobTitle,
      keySkills: finalScore.keySkills,
      matchNotes: finalScore.matchNotes,
      tailoredResume: finalResumeText,
      coverLetter: finalCoverLetter,
      fitScore: finalScore.fitScore,
      fitLabel: finalScore.fitLabel,
      fitWarning: finalScore.fitWarning
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error("Tailor route error:", e);
    return NextResponse.json({ error: "We couldn't tailor your documents right now. Please try again." }, { status: 500 });
  }
}
