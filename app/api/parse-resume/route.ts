import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Please choose a PDF file." }, { status: 400 });
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Only PDF files are supported." }, { status: 415 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Please upload a PDF smaller than 5 MB." }, { status: 413 });

    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });

    if (!text.trim()) return NextResponse.json({ error: "We couldn't find readable text in this PDF. Try pasting your resume instead." }, { status: 422 });
    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error("Parse resume error:", err);
    return NextResponse.json({ error: "We couldn't read that PDF. Try another file or paste the text." }, { status: 500 });
  }
}
