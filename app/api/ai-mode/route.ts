import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = process.env.ENABLE_PAID_AI === "true" && Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json({ enabled }, { headers: { "Cache-Control": "no-store" } });
}
