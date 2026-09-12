import { NextResponse } from "next/server";
import { localTailor } from "@/lib/tailor";
import type { TailorResult } from "@/lib/types";

export const runtime = "nodejs";

// Allows enough time for:
// scoring + generation + rescoring + optional retry
export const maxDuration = 60;

/* ────────────────────────────────────────────────────────────────────────
   ARCHITECTURE

   scoreResume()
   - Scores only.
   - Does not rewrite anything.
   - Uses temperature 0 for more consistent scoring.

   generateCandidate()
   - Always uses the ORIGINAL resume.
   - Never uses a previously generated resume as input.
   - Prevents progressive degradation/drift.

   POST()
   - Scores original resume.
   - Generates a tailored candidate.
   - Scores candidate with the SAME scoring function.
   - Accepts candidate only if score >= original score.
   - Retries once if candidate is worse.
   - Falls back to original resume if no candidate beats it.
   ──────────────────────────────────────────────────────────────────────── */

const SCORE_PROMPT = (resume: string, job: string) => `
You are an ethical, realistic hiring evaluator.

Score how well this resume ACTUALLY matches the supplied job description.

IMPORTANT RULES:
- Do not be encouraging just to make the user feel good.
- Do not inflate the score.
- Missing important/core job requirements must reduce the score.
- Only evaluate information actually present in the resume.
- Do not infer skills that are not explicitly or reasonably demonstrated.
- Use the same evaluation standard every time.
- Return only valid JSON.

Return exactly this structure:

{
  "fitScore": 0,
  "fitLabel": "Strong match",
  "fitWarning": null,
  "keySkills": [],
  "matchNotes": []
}

fitScore:
Integer from 0 to 100.

Suggested interpretation:

90-100 = Exceptional match
80-89 = Strong match
70-79 = Good match
60-69 = Reasonable match
40-59 = Significant gaps
0-39 = Poor fit for this role

fitLabel:
Use a short 2-4 word description.

fitWarning:
If fitScore is below 40, give one direct honest sentence explaining the main problem.
Otherwise return null.

keySkills:
Only include skills that:
1. appear in or are clearly supported by the resume
AND
2. are relevant to this job.

matchNotes:
Give concise notes describing:
- strongest matches
- missing important requirements
- important experience gaps
- education/certification gaps when relevant

RESUME:
${resume}

JOB DESCRIPTION:
${job}
`;

const GENERATE_PROMPT = (resume: string, job: string) => `
You are an ethical professional resume editor.

Rewrite the ORIGINAL resume so it is better positioned for the supplied job.

STRICT FACTUAL RULES:

You MUST NOT invent:
- employers
- job titles
- dates
- work experience
- education
- certifications
- skills
- software/tools
- projects
- achievements
- responsibilities
- numerical metrics
- revenue figures
- percentages
- team sizes

You may ONLY:
- rephrase existing information
- reorganize content
- prioritize relevant experience
- improve clarity
- improve professional wording
- move relevant skills higher
- naturally use terminology from the job description when the original resume supports it

Do not keyword-stuff.

Do not add a missing skill simply because the job description requires it.

Do not remove valuable existing experience or skills that help the candidate match the job.

IMPORTANT:
The ORIGINAL RESUME below is the ONLY factual source of truth.

Never rely on or recreate information from previous generated drafts.

Also generate an honest cover letter based only on the same resume facts.

Return ONLY valid JSON in exactly this structure:

{
  "jobTitle": "",
  "tailoredResume": "",
  "coverLetter": ""
}

TAILORED RESUME REQUIREMENTS:

Use plain text.

Use clear sections when appropriate, such as:

NAME
CONTACT
PROFESSIONAL SUMMARY
SKILLS
EXPERIENCE
EDUCATION
PROJECTS
CERTIFICATIONS

Preserve factual dates and employer information.

Use concise professional bullet points.

COVER LETTER REQUIREMENTS:

- Professional tone
- Relevant to the job
- Based only on facts from the resume
- Do not fabricate achievements
- Do not claim missing skills
- Avoid excessive generic language

ORIGINAL RESUME:
${resume}

JOB DESCRIPTION:
${job}
`;

type ScoreResult = {
  fitScore: number;
  fitLabel: string;
  fitWarning: string | null;
  keySkills: string[];
  matchNotes: string[];
};

type GenResult = {
  jobTitle: string;
  tailoredResume: string;
  coverLetter: string;
};

async function callGemini(prompt: string) {
  /*
    If GEMINI_MODEL exists in Vercel, that value wins.

    Otherwise the app automatically uses:

    gemini-3.5-flash-lite
  */
  const model =
    process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],

        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json"
        }
      }),

      cache: "no-store"
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      `[Gemini API error] model=${model} status=${response.status}`,
      errorText
    );

    throw new Error(
      `Gemini API returned ${response.status}`
    );
  }

  const payload = await response.json();

  let raw =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  raw = raw.trim();

  if (!raw) {
    console.error("Gemini returned empty output:", payload);
    throw new Error("Gemini returned an empty response");
  }

  /*
    responseMimeType should normally return clean JSON,
    but this protects against markdown fences such as:

    ```json
    {...}
    ```
  */
  if (raw.startsWith("```")) {
    raw = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse Gemini JSON:", raw);
    throw new Error("Gemini returned invalid JSON");
  }
}

function clampScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

async function scoreResume(
  resume: string,
  job: string
): Promise<ScoreResult> {
  const r = await callGemini(
    SCORE_PROMPT(resume, job)
  );

  const fitScore = clampScore(r.fitScore);

  return {
    fitScore,

    fitLabel:
      typeof r.fitLabel === "string" && r.fitLabel.trim()
        ? r.fitLabel.trim()
        : "Fit unclear",

    fitWarning:
      fitScore < 40
        ? typeof r.fitWarning === "string"
          ? r.fitWarning.trim()
          : null
        : null,

    keySkills: Array.isArray(r.keySkills)
      ? r.keySkills
          .filter((x: unknown) => typeof x === "string")
          .map((x: string) => x.trim())
          .filter(Boolean)
      : [],

    matchNotes: Array.isArray(r.matchNotes)
      ? r.matchNotes
          .filter((x: unknown) => typeof x === "string")
          .map((x: string) => x.trim())
          .filter(Boolean)
      : []
  };
}

async function generateCandidate(
  originalResume: string,
  job: string
): Promise<GenResult> {
  const r = await callGemini(
    GENERATE_PROMPT(originalResume, job)
  );

  return {
    jobTitle:
      typeof r.jobTitle === "string" &&
      r.jobTitle.trim()
        ? r.jobTitle.trim()
        : "this role",

    tailoredResume:
      typeof r.tailoredResume === "string" &&
      r.tailoredResume.trim()
        ? r.tailoredResume.trim()
        : originalResume,

    coverLetter:
      typeof r.coverLetter === "string"
        ? r.coverLetter.trim()
        : ""
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const resume =
      typeof body?.resume === "string"
        ? body.resume.trim()
        : "";

    const jobDescription =
      typeof body?.jobDescription === "string"
        ? body.jobDescription.trim()
        : "";

    /* --------------------------------------------------
       VALIDATION
       -------------------------------------------------- */

    if (!resume || !jobDescription) {
      return NextResponse.json(
        {
          error:
            "Add both your resume and the job description."
        },
        {
          status: 400
        }
      );
    }

    if (
      resume.length > 30000 ||
      jobDescription.length > 20000
    ) {
      return NextResponse.json(
        {
          error:
            "The text is too long. Please shorten it and try again."
        },
        {
          status: 413
        }
      );
    }

    /*
      Keep your existing local fallback.

      If GEMINI_API_KEY does not exist,
      localTailor() is used instead.
    */
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "[tailor] GEMINI_API_KEY missing - using localTailor fallback"
      );

      return NextResponse.json(
        localTailor(resume, jobDescription)
      );
    }

    /* --------------------------------------------------
       STEP 1

       Score ORIGINAL resume and generate first candidate
       at the same time.

       Neither operation depends on the other, so parallel
       execution reduces latency.
       -------------------------------------------------- */

    const [originalScore, firstCandidate] =
      await Promise.all([
        scoreResume(resume, jobDescription),

        /*
          IMPORTANT:
          Always send ORIGINAL resume.
        */
        generateCandidate(
          resume,
          jobDescription
        )
      ]);

    console.log(
      `[tailor] original score: ${originalScore.fitScore}`
    );

    /* --------------------------------------------------
       RETRIES

       MAX_RETRIES = 1 means:

       Attempt 1 = first candidate
       Attempt 2 = one retry

       Total maximum = 2 generated candidates.
       -------------------------------------------------- */

    const MAX_RETRIES = 1;

    let best:
      | {
          gen: GenResult;
          score: ScoreResult;
        }
      | null = null;

    let candidate = firstCandidate;

    for (
      let attempt = 0;
      attempt <= MAX_RETRIES;
      attempt++
    ) {
      /*
        On retries ONLY, generate a new candidate.

        Always regenerate from the ORIGINAL resume.

        NEVER:

        generateCandidate(previousTailoredResume, job)

        because repeated AI-to-AI rewriting causes information
        loss and score drift.
      */
      if (attempt > 0) {
        candidate = await generateCandidate(
          resume,
          jobDescription
        );
      }

      /*
        Score the candidate using exactly the SAME scorer
        used for the original resume.
      */
      const candidateScore =
        await scoreResume(
          candidate.tailoredResume,
          jobDescription
        );

      console.log(
        `[tailor] attempt ${attempt + 1}: candidate=${candidateScore.fitScore}, original=${originalScore.fitScore}`
      );

      /*
        Remember best candidate.
      */
      if (
        !best ||
        candidateScore.fitScore >
          best.score.fitScore
      ) {
        best = {
          gen: candidate,
          score: candidateScore
        };
      }

      /*
        Candidate has matched or beaten original.

        Accept it immediately instead of wasting another
        model call.
      */
      if (
        candidateScore.fitScore >=
        originalScore.fitScore
      ) {
        break;
      }
    }

    /* --------------------------------------------------
       FINAL SELECTION

       Never return a resume with a score LOWER than
       the original resume.
       -------------------------------------------------- */

    const finalUsesOriginal =
      !best ||
      best.score.fitScore <
        originalScore.fitScore;

    const finalResumeText =
      finalUsesOriginal
        ? resume
        : best!.gen.tailoredResume;

    const finalScore =
      finalUsesOriginal
        ? originalScore
        : best!.score;

    /*
      Even if the generated resume was rejected because its
      score was lower, the cover letter can still be useful
      because it was generated from the original truthful
      source resume.
    */
    const finalCoverLetter =
      best?.gen.coverLetter || "";

    const finalJobTitle =
      best?.gen.jobTitle || "this role";

    const result: TailorResult = {
      jobTitle: finalJobTitle,

      keySkills: finalScore.keySkills,

      matchNotes: finalScore.matchNotes,

      tailoredResume: finalResumeText,

      coverLetter: finalCoverLetter,

      fitScore: finalScore.fitScore,

      fitLabel: finalScore.fitLabel,

      fitWarning:
        finalScore.fitWarning
    };

    console.log(
      `[tailor] final score=${result.fitScore}, usedOriginal=${finalUsesOriginal}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Tailor route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We couldn't tailor your documents right now. Please try again."
      },
      {
        status: 500
      }
    );
  }
}
