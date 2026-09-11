import { NextResponse } from "next/server";
import { localTailor } from "@/lib/tailor";
import type { TailorResult } from "@/lib/types";

export const runtime = "nodejs";

const systemPrompt = `You are an ethical career editor. Tailor a resume to a job description using ONLY facts already present in the resume. Never invent experience, employers, dates, education, tools, metrics, or achievements. Rephrase and reprioritize honestly.

You must also honestly assess how well this candidate actually fits the role, even if that means telling them it's a poor fit. Do not soften this assessment to be encouraging - the candidate needs accurate information, not false hope.

Return valid JSON with exactly these fields:
- jobTitle (string)
- keySkills (string array): skills from the resume that are genuinely relevant to this job
- matchNotes (string array): honest notes on what matches and what's missing
- tailoredResume (plain text with headings and bullets)
- coverLetter (plain text)
- fitScore (number 0-100): your honest estimate of how well this candidate's ACTUAL experience matches the role's core requirements. A recent bootcamp grad applying to a role requiring 3+ years professional experience should score low (10-30), not be inflated to seem encouraging. A candidate missing one or two nice-to-have skills but meeting the core requirements should score high (70-90). Be realistic, not generous.
- fitLabel (string): a short 2-4 word label matching the score, e.g. "Strong match", "Reasonable match", "Significant gaps", "Poor fit for this role"
- fitWarning (string or null): if fitScore is below 40, write ONE direct, honest sentence telling the candidate this role is a stretch and why, without discouraging them from growing toward it. If fitScore is 40 or above, set this to null.

Rephrase and reprioritize honestly. If a requirement is absent, mention the gap in matchNotes; do not add it to the resume as experience.`;

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();
    if (!resume?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: "Add both your resume and the job description." }, { status: 400 });
    if (resume.length > 30000 || jobDescription.length > 20000) return NextResponse.json({ error: "The text is too long. Please shorten it and try again." }, { status: 413 });

    if (!process.env.GEMINI_API_KEY) return NextResponse.json(localTailor(resume, jobDescription));

    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\nRESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRespond with ONLY the JSON object, no markdown fences, no extra text.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json"
          }
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

    const result = JSON.parse(raw) as TailorResult;

    // Safety net: if the model omitted fit fields, don't crash the UI
    if (typeof result.fitScore !== "number") result.fitScore = 50;
    if (!result.fitLabel) result.fitLabel = "Fit unclear";
    if (result.fitScore >= 40) result.fitWarning = null;

    return NextResponse.json(result);
  } catch (e) {
    console.error("Tailor route error:", e);
    return NextResponse.json({ error: "We couldn't tailor your documents right now. Please try again." }, { status: 500 });
  }
}
