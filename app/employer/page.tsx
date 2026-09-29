"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, type User } from "@supabase/supabase-js";

type EmployerJob = { id: string; title: string; company_name: string; location: string; status: string; created_at: string };

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export default function EmployerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = client();
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth.user);
      if (auth.user) {
        const { data } = await supabase.from("jobs").select("id,title,company_name,location,status,created_at").eq("employer_id", auth.user.id).order("created_at", { ascending: false });
        setJobs((data || []) as EmployerJob[]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <main className="min-h-screen bg-[#fbfaf7] p-8">Loading employer workspace…</main>;
  if (!user) return <main className="min-h-screen bg-[#fbfaf7] px-5 py-16"><div className="mx-auto max-w-xl rounded-3xl border border-[#eadfeb] bg-white p-8"><h1 className="text-3xl font-semibold text-[#28122f]">Employer workspace</h1><p className="mt-3 text-[#6b586f]">Sign in before posting or managing jobs.</p><Link href="/auth" className="mt-7 inline-flex rounded-xl bg-[#28122f] px-5 py-3 font-bold text-white">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-[#fbfaf7] px-5 py-12 text-[#28122f]"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[#84419b]">Employer</p><h1 className="mt-2 text-4xl font-semibold">Your job posts</h1><p className="mt-2 text-[#6b586f]">Create drafts, publish openings and manage your listings.</p></div><Link href="/employer/jobs/new" className="rounded-xl bg-[#28122f] px-5 py-3 font-bold text-white">Post a job</Link></div>
    <div className="mt-9 space-y-3">{jobs.length === 0 ? <div className="rounded-2xl border border-[#eadfeb] bg-white p-7"><h2 className="font-semibold">No jobs yet</h2><p className="mt-2 text-sm text-[#806f83]">Create your first job post. It starts as a draft until you choose to publish it.</p></div> : jobs.map(job => <div key={job.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eadfeb] bg-white p-5"><div><h2 className="font-semibold">{job.title}</h2><p className="mt-1 text-sm text-[#806f83]">{job.company_name} · {job.location}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-[#f4edf6] px-3 py-1 text-xs font-bold uppercase">{job.status}</span><Link href={`/jobs/${job.id}`} className="font-bold text-[#84419b]">View</Link></div></div>)}</div>
  </div></main>;
}
