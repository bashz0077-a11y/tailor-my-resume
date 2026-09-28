"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError("Supabase is not configured yet.");
      setLoading(false);
      return;
    }
    const supabase = createClient(url, key);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#fbfaf7] px-5 py-16 text-[#28122f]">
    <div className="mx-auto max-w-md rounded-3xl border border-[#eadfeb] bg-white p-8 shadow-sm">
      <Link href="/" className="text-sm font-bold text-[#84419b]">← TailorMyResume</Link>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">Your career workspace</h1>
      <p className="mt-3 leading-7 text-[#6b586f]">Sign in to build your account foundation. Job seeker and employer tools will grow from this account.</p>
      <button onClick={signInWithGoogle} disabled={loading} className="mt-8 w-full rounded-xl bg-[#28122f] px-5 py-3.5 font-bold text-white disabled:opacity-60">
        {loading ? "Opening Google…" : "Continue with Google"}
      </button>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <p className="mt-6 text-xs leading-5 text-[#806f83]">By continuing, you create a secure TailorMyResume account through Supabase authentication.</p>
    </div>
  </main>;
}
