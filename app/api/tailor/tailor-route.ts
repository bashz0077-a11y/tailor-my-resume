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

    if (!process.env.OPENAI_API_KEY) return NextResponse.json(localTailor(resume, jobDescription));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", response_format: { type: "json_object" }, temperature: 0.25, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}` }] })
    });
    if (!response.ok) throw new Error("AI service error");
    const payload = await response.json();
    const result = JSON.parse(payload.choices[0].message.content) as TailorResult;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "We couldn't tailor your documents right now. Please try again." }, { status: 500 });
  }
}
