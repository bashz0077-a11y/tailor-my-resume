"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export default function ApplyToJob({ jobId }: { jobId: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [coverNote, setCoverNote] = useState("");

  useEffect(() => {
    const supabase = client();
    if (!supabase) { setSignedIn(false); return; }
    let active = true;
    (async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError) { setMessage("Could not verify your session. Please refresh and try again."); setSignedIn(false); return; }
        setSignedIn(Boolean(data.user));
        setApplied(false);
        if (data.user) {
          const { data: existing, error } = await supabase.from("applications").select("id").eq("job_id", jobId).eq("applicant_id", data.user.id).maybeSingle();
          if (!active) return;
          if (error) setMessage("Could not check your application status. Please refresh and try again.");
          else setApplied(Boolean(existing));
        }
      } catch {
        if (active) { setSignedIn(false); setMessage("Could not check your application status. Please try again."); }
      }
    })();
    return () => { active = false; };
  }, [jobId]);

  async function apply() {
    const supabase = client();
    if (!supabase) return;
    setBusy(true); setMessage("");
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) { setSignedIn(false); setMessage("Please sign in again before applying."); return; }
      const { error } = await supabase.from("applications").insert({ job_id: jobId, applicant_id: data.user.id, cover_note: coverNote.trim() });
      if (error) {
        if (error.code === "23505") setApplied(true);
        else setMessage("We couldn't submit your application. Please check that this job is open and try again.");
      } else setApplied(true);
    } catch {
      setMessage("Unable to submit your application right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (signedIn === null) return <div className="mt-4 text-sm text-[#bfaec5]">Checking application status…</div>;
  if (!signedIn) return <div className="mt-4">{message && <p role="alert" className="mb-2 text-sm text-red-200">{message}</p>}<Link href="/auth" className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#dfff6b] px-6 font-extrabold text-[#28122f]">Sign in to apply</Link></div>;
  if (applied) return <div className="mt-4"><div className="rounded-2xl bg-[#dfff6b] px-4 py-3 text-center font-extrabold text-[#28122f]">Application submitted ✓</div><Link href="/applications" className="mt-3 inline-flex w-full justify-center text-sm font-bold text-white underline">View my applications</Link></div>;
  return <div className="mt-4"><label htmlFor="application-cover-note" className="mb-2 block text-sm font-bold text-white">Cover note (optional)</label><textarea id="application-cover-note" maxLength={2000} rows={4} value={coverNote} onChange={e=>setCoverNote(e.target.value)} placeholder="Introduce yourself and explain why you fit this role…" className="mb-2 w-full rounded-xl border border-white/30 bg-white p-3 text-sm text-[#28122f] placeholder:text-[#806f83]" /><p className="mb-3 text-right text-xs text-[#bfaec5]">{coverNote.length}/2000</p><button type="button" disabled={busy} onClick={apply} className="min-h-12 w-full rounded-full bg-[#dfff6b] px-6 font-extrabold text-[#28122f] disabled:opacity-60">{busy ? "Applying…" : "Apply with TailorMyResume"}</button>{message && <p role="alert" className="mt-2 text-sm text-red-200">{message}</p>}</div>;
}
