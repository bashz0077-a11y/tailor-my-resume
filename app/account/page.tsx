"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type Profile = {
  full_name: string; headline: string; location: string; skills: string[];
  experience_level: string; preferred_workplace: string[]; preferred_employment: string[];
};

const empty: Profile = { full_name:"", headline:"", location:"", skills:[], experience_level:"", preferred_workplace:[], preferred_employment:[] };
const workplace = ["Remote","Hybrid","On-site"];
const employment = ["Full-time","Part-time","Contract","Internship"];

function client() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url&&key?createClient(url,key):null;
}

export default function AccountPage() {
  const [user,setUser]=useState<User|null>(null),[supabase,setSupabase]=useState<SupabaseClient|null>(null);
  const [profile,setProfile]=useState<Profile>(empty),[skillsText,setSkillsText]=useState("");
  const [ready,setReady]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState("");

  useEffect(()=>{const s=client(); if(!s){setReady(true);return} setSupabase(s); void(async()=>{
    const {data}=await s.auth.getUser(); setUser(data.user);
    if(data.user){const {data:p}=await s.from("profiles").select("full_name,headline,location,skills,experience_level,preferred_workplace,preferred_employment").eq("id",data.user.id).maybeSingle();
      if(p){const next=p as Profile;setProfile(next);setSkillsText((next.skills||[]).join(", "));}}
    setReady(true);
  })()},[]);

  function toggle(field:"preferred_workplace"|"preferred_employment",value:string){
    setProfile(p=>({...p,[field]:p[field].includes(value)?p[field].filter(x=>x!==value):[...p[field],value]}));
  }

  async function save(e:FormEvent){e.preventDefault();if(!supabase||!user||saving)return;setSaving(true);setMessage("");
    const skills=skillsText.split(",").map(x=>x.trim()).filter(Boolean).slice(0,30);
    const {error}=await supabase.from("profiles").update({...profile,skills}).eq("id",user.id);
    setSaving(false); if(error){setMessage("Profile could not be saved. Please try again.");return}
    setProfile(p=>({...p,skills}));setMessage("Career profile saved.");
  }

  if(!ready)return <main className="min-h-screen bg-[#fbfaf7] p-8">Loading account…</main>;
  if(!user)return <main className="min-h-screen bg-[#fbfaf7] px-5 py-16"><div className="mx-auto max-w-xl rounded-3xl border border-[#eadfeb] bg-white p-8"><h1 className="text-3xl font-semibold text-[#28122f]">Sign in to your account</h1><p className="mt-3 text-[#6b586f]">Manage your career profile, saved jobs and applications.</p><Link href="/auth" className="mt-7 inline-flex rounded-xl bg-[#28122f] px-5 py-3 font-bold text-white">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-[#fbfaf7] px-5 py-12 text-[#28122f]"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[#84419b]">Career profile</p><h1 className="mt-2 text-4xl font-semibold">Your job preferences</h1><p className="mt-2 text-[#6b586f]">{user.email}</p></div><Link href="/dashboard" className="rounded-xl border border-[#dfd0e3] bg-white px-4 py-2 font-bold">Dashboard</Link></div>
    <form onSubmit={save} className="mt-8 space-y-6 rounded-3xl border border-[#eadfeb] bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name"><input value={profile.full_name} onChange={e=>setProfile({...profile,full_name:e.target.value})} maxLength={100} className="input" /></Field>
        <Field label="Professional headline"><input value={profile.headline} onChange={e=>setProfile({...profile,headline:e.target.value})} maxLength={160} placeholder="Full-stack developer" className="input" /></Field>
        <Field label="Location"><input value={profile.location} onChange={e=>setProfile({...profile,location:e.target.value})} maxLength={120} placeholder="Chennai, Tamil Nadu" className="input" /></Field>
        <Field label="Experience level"><select value={profile.experience_level} onChange={e=>setProfile({...profile,experience_level:e.target.value})} className="input"><option value="">Select level</option>{["Entry level","Mid level","Senior level","Lead / Manager"].map(x=><option key={x}>{x}</option>)}</select></Field>
      </div>
      <Field label="Skills" hint="Separate skills with commas."><input value={skillsText} onChange={e=>setSkillsText(e.target.value)} maxLength={500} placeholder="React, TypeScript, Next.js, Supabase" className="input" /></Field>
      <Choice title="Preferred workplace" values={workplace} selected={profile.preferred_workplace} toggle={v=>toggle("preferred_workplace",v)} />
      <Choice title="Employment type" values={employment} selected={profile.preferred_employment} toggle={v=>toggle("preferred_employment",v)} />
      {message&&<p role="status" className="rounded-xl bg-[#f6f0f7] p-3 text-sm font-semibold">{message}</p>}
      <button disabled={saving} className="rounded-xl bg-[#28122f] px-6 py-3 font-bold text-white disabled:opacity-60">{saving?"Saving…":"Save career profile"}</button>
    </form>
  </div></main>;
}
function Field({label,hint,children}:{label:string;hint?:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span>{children}{hint&&<span className="mt-1 block text-xs text-[#806f83]">{hint}</span>}</label>}
function Choice({title,values,selected,toggle}:{title:string;values:string[];selected:string[];toggle:(v:string)=>void}){return <fieldset><legend className="text-sm font-bold">{title}</legend><div className="mt-3 flex flex-wrap gap-2">{values.map(v=><button type="button" key={v} aria-pressed={selected.includes(v)} onClick={()=>toggle(v)} className={`rounded-full border px-4 py-2 text-sm font-bold ${selected.includes(v)?"border-[#84419b] bg-[#f1e8f3] text-[#60346e]":"border-[#dfd0e3] bg-white"}`}>{v}</button>)}</div></fieldset>}
