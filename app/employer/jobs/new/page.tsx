"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const input = "w-full rounded-xl border border-[#dfd0e3] bg-white px-4 py-3 outline-none focus:border-[#84419b]";

export default function NewJobPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", company_name: "", location: "", workplace_type: "Remote", employment_type: "Full-time", experience_level: "Entry level", description: "", required_skills: "", application_url: "" });
  const set = (key: string, value: string) => setForm(v => ({ ...v, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setError("Supabase environment variables are not configured."); setBusy(false); return; }
    const supabase = createClient(url, key);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.push("/auth"); return; }
    const payload = { ...form, employer_id: auth.user.id, status: "draft", required_skills: form.required_skills.split(",").map(s => s.trim()).filter(Boolean) };
    const { error: insertError } = await supabase.from("jobs").insert(payload);
    if (insertError) { setError(insertError.message); setBusy(false); return; }
    router.push("/employer"); router.refresh();
  }

  return <main className="min-h-screen bg-[#fbfaf7] px-5 py-12 text-[#28122f]"><form onSubmit={submit} className="mx-auto max-w-3xl rounded-3xl border border-[#eadfeb] bg-white p-6 sm:p-9">
    <Link href="/employer" className="text-sm font-bold text-[#84419b]">← Employer dashboard</Link><h1 className="mt-5 text-4xl font-semibold">Post a job</h1><p className="mt-2 text-[#6b586f]">Create a complete job listing. New listings are saved safely as drafts.</p>
    <div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Job title<input required className={`${input} mt-2`} value={form.title} onChange={e=>set("title",e.target.value)} /></label><label className="text-sm font-bold">Company<input required className={`${input} mt-2`} value={form.company_name} onChange={e=>set("company_name",e.target.value)} /></label><label className="text-sm font-bold">Location<input required className={`${input} mt-2`} value={form.location} onChange={e=>set("location",e.target.value)} /></label><label className="text-sm font-bold">Workplace<select className={`${input} mt-2`} value={form.workplace_type} onChange={e=>set("workplace_type",e.target.value)}>{["Remote","Hybrid","On-site"].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-sm font-bold">Employment type<select className={`${input} mt-2`} value={form.employment_type} onChange={e=>set("employment_type",e.target.value)}>{["Full-time","Part-time","Contract","Internship"].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-sm font-bold">Experience<select className={`${input} mt-2`} value={form.experience_level} onChange={e=>set("experience_level",e.target.value)}>{["Entry level","Mid level","Senior","Lead"].map(x=><option key={x}>{x}</option>)}</select></label></div>
    <label className="mt-5 block text-sm font-bold">Required skills <span className="font-normal text-[#806f83]">(comma separated)</span><input className={`${input} mt-2`} value={form.required_skills} onChange={e=>set("required_skills",e.target.value)} placeholder="React, TypeScript, PostgreSQL" /></label><label className="mt-5 block text-sm font-bold">Application URL<input className={`${input} mt-2`} type="url" value={form.application_url} onChange={e=>set("application_url",e.target.value)} placeholder="https://…" /></label><label className="mt-5 block text-sm font-bold">Job description<textarea required rows={8} className={`${input} mt-2 resize-y`} value={form.description} onChange={e=>set("description",e.target.value)} /></label>
    {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={busy} className="mt-7 rounded-xl bg-[#28122f] px-6 py-3 font-bold text-white disabled:opacity-60">{busy ? "Saving…" : "Save draft"}</button>
  </form></main>;
}
