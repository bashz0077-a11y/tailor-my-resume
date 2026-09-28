"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, type User } from "@supabase/supabase-js";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setReady(true); return; }
    const supabase = createClient(url, key);
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setReady(true); });
  }, []);

  if (!ready) return <main className="min-h-screen bg-[#fbfaf7] p-8">Loading account…</main>;
  if (!user) return <main className="min-h-screen bg-[#fbfaf7] px-5 py-16"><div className="mx-auto max-w-xl rounded-3xl border border-[#eadfeb] bg-white p-8"><h1 className="text-3xl font-semibold text-[#28122f]">Sign in to your account</h1><p className="mt-3 text-[#6b586f]">Your saved resumes, jobs and applications will live here.</p><Link href="/auth" className="mt-7 inline-flex rounded-xl bg-[#28122f] px-5 py-3 font-bold text-white">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-[#fbfaf7] px-5 py-14 text-[#28122f]"><div className="mx-auto max-w-5xl">
    <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[#84419b]">Account</p><h1 className="mt-2 text-4xl font-semibold">Welcome back</h1><p className="mt-2 text-[#6b586f]">{user.email}</p></div><Link href="/jobs" className="rounded-xl border border-[#dfd0e3] bg-white px-4 py-2 font-bold">Explore jobs</Link></div>
    <div className="mt-10 grid gap-4 sm:grid-cols-3">{["Saved resumes","Saved jobs","Applications"].map((label) => <div key={label} className="rounded-2xl border border-[#eadfeb] bg-white p-6"><h2 className="font-semibold">{label}</h2><p className="mt-2 text-sm text-[#806f83]">Coming in the next account PRs.</p></div>)}</div>
  </div></main>;
}
