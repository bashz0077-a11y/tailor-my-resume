import { NextResponse } from "next/server";
import { localTailor } from "@/lib/tailor";
import type { TailorResult } from "@/lib/types";

export const runtime = "nodejs";

const systemPrompt = `You are an ethical career editor. Tailor a resume to a job description using ONLY facts already present in the resume. Never invent experience, employers, dates, education, tools, metrics, or achievements. Rephrase and reprioritize honestly. Return valid JSON with: jobTitle (string), keySkills (string array), matchNotes (string array), tailoredResume (plain text with headings and bullets), coverLetter (plain text). If a requirement is absent, mention the gap in matchNotes; do not add it to the resume as experience.`;

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();
    if (!resume?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: "Add both your resume and the job description." }, { status: 400 });
    if (resume.length > 30000 || jobDescription.length > 20000) return NextResponse.json({ error: "The text is too long. Please shorten it and try again." }, { status: 413 });

    if (!process.env.GEMINI_API_KEY) return NextResponse.json(localTailor(resume, jobDescription));

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
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

    // Safety net in case the model still wraps the JSON in markdown fences
    raw = raw.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    const result = JSON.parse(raw) as TailorResult;
    return NextResponse.json(result);
  } catch (e) {
    console.error("Tailor route error:", e);
    return NextResponse.json({ error: "We couldn't tailor your documents right now. Please try again." }, { status: 500 });
  }
}
