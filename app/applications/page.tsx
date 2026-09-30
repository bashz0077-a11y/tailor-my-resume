"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Application = { id:string; job_id:string; status:string; created_at:string; jobs: { title:string; company_name:string; location:string } | null };
function client(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL;const k=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createClient(u,k):null;}

export default function ApplicationsPage(){
 const [items,setItems]=useState<Application[]>([]); const [loading,setLoading]=useState(true); const [signedIn,setSignedIn]=useState(false);
 useEffect(()=>{const s=client(); if(!s){setLoading(false);return;} (async()=>{const {data:a}=await s.auth.getUser();setSignedIn(Boolean(a.user));if(a.user){const {data}=await s.from("applications").select("id,job_id,status,created_at,jobs(title,company_name,location)").eq("applicant_id",a.user.id).order("created_at",{ascending:false});setItems((data||[]) as unknown as Application[]);}setLoading(false);})();},[]);
 if(loading)return <main className="min-h-screen bg-[#fbfaf7] p-8">Loading applications…</main>;
 if(!signedIn)return <main className="min-h-screen bg-[#fbfaf7] px-5 py-16"><div className="mx-auto max-w-xl rounded-3xl border bg-white p-8"><h1 className="text-3xl font-semibold text-[#28122f]">My applications</h1><p className="mt-3 text-[#6b586f]">Sign in to track jobs you applied to.</p><Link href="/auth" className="mt-6 inline-flex rounded-xl bg-[#28122f] px-5 py-3 font-bold text-white">Sign in</Link></div></main>;
 return <main className="min-h-screen bg-[#fbfaf7] px-5 py-12 text-[#28122f]"><div className="mx-auto max-w-4xl"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[#84419b]">Job seeker</p><h1 className="mt-2 text-4xl font-semibold">My applications</h1><p className="mt-2 text-[#6b586f]">Track every application and its latest status.</p></div><Link href="/jobs" className="font-bold text-[#84419b]">Find jobs</Link></div><div className="mt-8 space-y-3">{items.length===0?<div className="rounded-2xl border bg-white p-7"><h2 className="font-semibold">No applications yet</h2><p className="mt-2 text-sm text-[#806f83]">Find an open job and apply directly from its job page.</p></div>:items.map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eadfeb] bg-white p-5"><div><Link href={`/jobs/${a.job_id}`} className="font-semibold hover:underline">{a.jobs?.title||"Job"}</Link><p className="mt-1 text-sm text-[#806f83]">{a.jobs?.company_name}{a.jobs?.location?` · ${a.jobs.location}`:""}</p></div><span className="rounded-full bg-[#f1e8f3] px-3 py-1 text-xs font-extrabold uppercase text-[#60346e]">{a.status}</span></div>)}</div></div></main>;
}
