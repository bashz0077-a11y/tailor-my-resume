import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bearer = request.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!url || !key || !bearer) return NextResponse.json({ error: "Sign in to view AI uses." }, { status: 401 });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${bearer}` } } });
  const { data: user, error } = await supabase.auth.getUser(bearer);
  if (error || !user.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  const { data, error: quotaError } = await supabase.rpc("get_ai_tailor_uses");
  if (quotaError || typeof data !== "number") return NextResponse.json({ error: "Usage unavailable." }, { status: 503 });
  return NextResponse.json({ used: Math.max(0, Math.min(3, data)), limit: 3 }, { headers: { "Cache-Control": "no-store" } });
}
