import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Please choose a PDF file." }, { status: 400 });
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Only PDF files are supported." }, { status: 415 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Please upload a PDF smaller than 5 MB." }, { status: 413 });
    // @ts-expect-error - no type declarations for this internal path
const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const parsed = await pdf(Buffer.from(await file.arrayBuffer()));
    if (!parsed.text.trim()) return NextResponse.json({ error: "We couldn't find readable text in this PDF. Try pasting your resume instead." }, { status: 422 });
    return NextResponse.json({ text: parsed.text.trim() });
  } catch {
    return NextResponse.json({ error: "We couldn't read that PDF. Try another file or paste the text." }, { status: 500 });
  }
}
