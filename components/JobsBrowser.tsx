"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Search } from "lucide-react";
import type { Job } from "@/lib/jobs";

export default function JobsBrowser({ jobs }: { jobs: Job[] }) {
  const [query,setQuery]=useState(""); const [workplace,setWorkplace]=useState("All");
  const filtered=useMemo(()=>jobs.filter(job=>{
    const haystack=`${job.title} ${job.company} ${job.location} ${job.requiredSkills.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (workplace==="All" || job.workplaceType===workplace);
  }),[jobs,query,workplace]);
  return <div>
    <div className="mb-8 grid gap-3 rounded-3xl border border-[#e3d9e6] bg-white p-4 shadow-soft sm:grid-cols-[1fr_180px]">
      <label className="flex items-center gap-3 rounded-2xl border border-[#dfd4e1] px-4"><Search size={18} className="text-[#8b499f]"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="Search title, company, skill or location"/></label>
      <select value={workplace} onChange={e=>setWorkplace(e.target.value)} className="rounded-2xl border border-[#dfd4e1] bg-white px-4 py-3 font-semibold"><option>All</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select>
    </div>
    <div className="grid gap-5">{filtered.map(job=><article key={job.id} className="rounded-3xl border border-[#e3d9e6] bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:justify-between"><div><div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#8b499f]"><Briefcase size={15}/>{job.company}</div><h2 className="text-2xl font-extrabold tracking-tight text-[#28122f]">{job.title}</h2><p className="mt-2 flex items-center gap-2 text-[#6d5b72]"><MapPin size={16}/>{job.location} · {job.workplaceType}</p><p className="mt-4 max-w-3xl leading-7 text-[#66546b]">{job.summary}</p><div className="mt-4 flex flex-wrap gap-2">{job.requiredSkills.slice(0,5).map(s=><span key={s} className="rounded-full bg-[#f2ebf4] px-3 py-1 text-xs font-bold text-[#6d347f]">{s}</span>)}</div></div><div className="shrink-0 sm:text-right"><p className="text-sm font-bold text-[#76647a]">{job.posted}</p><p className="mt-1 text-sm text-[#76647a]">{job.employmentType} · {job.experienceLevel}</p>{job.salary&&<p className="mt-1 font-bold text-[#3c2842]">{job.salary}</p>}<Link href={`/jobs/${job.id}`} className="mt-5 inline-flex rounded-full bg-[#52205f] px-5 py-3 font-extrabold text-white hover:bg-[#6e2d80]">View Job</Link></div></div>
    </article>)}{filtered.length===0&&<div className="rounded-3xl border border-dashed border-[#d9cae0] p-10 text-center text-[#76647a]">No jobs match your search.</div>}</div>
  </div>;
}
