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

  useEffect(() => {
    const supabase = client();
    if (!supabase) { setSignedIn(false); return; }
    (async () => {
      const { data } = await supabase.auth.getUser();
      setSignedIn(Boolean(data.user));
      if (data.user) {
        const { data: existing } = await supabase.from("applications").select("id").eq("job_id", jobId).eq("applicant_id", data.user.id).maybeSingle();
        setApplied(Boolean(existing));
      }
    })();
  }, [jobId]);

  async function apply() {
    const supabase = client();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { data } = await supabase.auth.getUser();
    if (!data.user) { setSignedIn(false); setBusy(false); return; }
    const { error } = await supabase.from("applications").insert({ job_id: jobId, applicant_id: data.user.id });
    if (error) {
      if (error.code === "23505") setApplied(true);
      else setMessage(error.message);
    } else setApplied(true);
    setBusy(false);
  }

  if (signedIn === null) return <div className="mt-4 text-sm text-[#bfaec5]">Checking application status…</div>;
  if (!signedIn) return <Link href="/auth" className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#dfff6b] px-6 font-extrabold text-[#28122f]">Sign in to apply</Link>;
  if (applied) return <div className="mt-4"><div className="rounded-2xl bg-[#dfff6b] px-4 py-3 text-center font-extrabold text-[#28122f]">Application submitted ✓</div><Link href="/applications" className="mt-3 inline-flex w-full justify-center text-sm font-bold text-white underline">View my applications</Link></div>;
  return <div className="mt-4"><button type="button" disabled={busy} onClick={apply} className="min-h-12 w-full rounded-full bg-[#dfff6b] px-6 font-extrabold text-[#28122f] disabled:opacity-60">{busy ? "Applying…" : "Apply with TailorMyResume"}</button>{message && <p className="mt-2 text-sm text-red-200">{message}</p>}</div>;
}
