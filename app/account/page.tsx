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
  const [savedProfile,setSavedProfile]=useState<Profile|null>(null);
  const [ready,setReady]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState(""),[loadError,setLoadError]=useState("");

  useEffect(()=>{const s=client(); if(!s){setLoadError("Account service is unavailable. Please try again later.");setReady(true);return} setSupabase(s); void(async()=>{
    const {data,error:authError}=await s.auth.getUser(); if(authError){setLoadError("Could not verify your session. Please sign in again.");setReady(true);return;} setUser(data.user);
    if(data.user){const {data:p,error:profileError}=await s.from("profiles").select("full_name,headline,location,skills,experience_level,preferred_workplace,preferred_employment").eq("id",data.user.id).maybeSingle();
      if(profileError||!p){setLoadError("Could not load your career profile. Please reload before editing.");}else{const next=p as Profile;setProfile(next);setSavedProfile(next);setSkillsText((next.skills||[]).join(", "));}}
    setReady(true);
  })()},[]);

  function toggle(field:"preferred_workplace"|"preferred_employment",value:string){
    setProfile(p=>({...p,[field]:p[field].includes(value)?p[field].filter(x=>x!==value):[...p[field],value]}));
  }

  async function save(e:FormEvent){e.preventDefault();if(!supabase||!user||saving||loadError)return;setSaving(true);setMessage("");
    const skills=Array.from(new Map(skillsText.split(",").map(x=>x.trim()).filter(Boolean).map(x=>[x.toLocaleLowerCase(),x])).values());
    if(skills.length>30){setMessage("Please use no more than 30 skills.");setSaving(false);return;}
    try{const {data:saved,error}=await supabase.from("profiles").update({...profile,skills}).eq("id",user.id).select("id").maybeSingle();
    if(error||!saved){setMessage("Profile was not saved. Please check your session and try again.");return;}
    const updated={...profile,skills};setProfile(updated);setSavedProfile(updated);setSkillsText(skills.join(", "));setMessage("Career profile saved.");}
    catch{setMessage("Profile could not be saved. Please try again.");}
    finally{setSaving(false);}
  }

  const normalizedSkills=Array.from(new Map(skillsText.split(",").map(x=>x.trim()).filter(Boolean).map(x=>[x.toLocaleLowerCase(),x])).values());
  const hasUnsavedChanges=Boolean(savedProfile)&&JSON.stringify({...profile,skills:normalizedSkills})!==JSON.stringify(savedProfile);
  function discardChanges(){if(!savedProfile||saving)return;setProfile(savedProfile);setSkillsText(savedProfile.skills.join(", "));setMessage("Unsaved changes discarded.");}

  useEffect(()=>{
    if(!hasUnsavedChanges)return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue="";};
    window.addEventListener("beforeunload",warn);
    return()=>window.removeEventListener("beforeunload",warn);
  },[hasUnsavedChanges]);

  function confirmLeave(event:React.MouseEvent<HTMLAnchorElement>){
    if(hasUnsavedChanges&&!window.confirm("You have unsaved career profile changes. Leave without saving?"))event.preventDefault();
  }

  const parsedSkills=skillsText.split(",").map(x=>x.trim()).filter(Boolean);
  const uniqueSkills=new Set(parsedSkills.map(x=>x.toLocaleLowerCase())).size;
  const fields=[{name:"Full name",complete:Boolean(profile.full_name?.trim())},{name:"Professional headline",complete:Boolean(profile.headline?.trim())},{name:"Location",complete:Boolean(profile.location?.trim())},{name:"Experience level",complete:Boolean(profile.experience_level)},{name:"Skills",complete:skillsText.split(",").some(x=>Boolean(x.trim()))},{name:"Workplace preferences",complete:profile.preferred_workplace.length>0},{name:"Employment preferences",complete:profile.preferred_employment.length>0}];
  const completed=fields.filter(f=>f.complete).length;
  const percentage=Math.round(completed/fields.length*100);

  if(!ready)return <main className="min-h-screen bg-[#fbfaf7] p-8">Loading account…</main>;
  if(!user)return <main className="min-h-screen bg-[#fbfaf7] px-5 py-16"><div className="mx-auto max-w-xl rounded-3xl border border-[#eadfeb] bg-white p-8"><h1 className="text-3xl font-semibold text-[#28122f]">Sign in to your account</h1><p className="mt-3 text-[#6b586f]">Manage your career profile, saved jobs and applications.</p><Link href="/auth" className="mt-7 inline-flex rounded-xl bg-[#28122f] px-5 py-3 font-bold text-white">Sign in</Link></div></main>;

  return <main className="min-h-screen bg-[#fbfaf7] px-5 py-12 text-[#28122f]"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[#84419b]">Career profile</p><h1 className="mt-2 text-4xl font-semibold">Your job preferences</h1><p className="mt-2 text-[#6b586f]">{user.email}</p></div><Link href="/dashboard" onClick={confirmLeave} className="rounded-xl border border-[#dfd0e3] bg-white px-4 py-2 font-bold">Dashboard</Link></div>
    <section aria-label="Career profile completion" className="mt-8 rounded-2xl border border-[#eadfeb] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Profile completion</h2><span className="text-sm font-bold text-[#84419b]">{percentage}% · {completed} of 7 fields</span></div><div role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="mt-3 h-2 overflow-hidden rounded-full bg-[#f1e8f3]"><div className="h-full rounded-full bg-[#84419b]" style={{width:`${percentage}%`}}/></div><p className="mt-3 text-sm text-[#806f83]">{percentage===100?"All profile sections are filled. Save your changes to update your dashboard.":`Still needed: ${fields.filter(f=>!f.complete).map(f=>f.name).join(", ")}.`}</p></section>
    {loadError&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">{loadError}</p>}
    <form onSubmit={save} className="mt-8 space-y-6 rounded-3xl border border-[#eadfeb] bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name"><input value={profile.full_name} onChange={e=>setProfile({...profile,full_name:e.target.value})} maxLength={100} className="input" /></Field>
        <Field label="Professional headline"><input value={profile.headline} onChange={e=>setProfile({...profile,headline:e.target.value})} maxLength={160} placeholder="Full-stack developer" className="input" /></Field>
        <Field label="Location"><input value={profile.location} onChange={e=>setProfile({...profile,location:e.target.value})} maxLength={120} placeholder="Chennai, Tamil Nadu" className="input" /></Field>
        <Field label="Experience level"><select value={profile.experience_level} onChange={e=>setProfile({...profile,experience_level:e.target.value})} className="input"><option value="">Select level</option>{["Entry level","Mid level","Senior level","Lead / Manager"].map(x=><option key={x}>{x}</option>)}</select></Field>
      </div>
      <Field label="Skills" hint="Separate skills with commas. Duplicates are removed when saving."><input value={skillsText} onChange={e=>setSkillsText(e.target.value)} maxLength={500} aria-describedby="skills-count" placeholder="React, TypeScript, Next.js, Supabase" className="input" /><span id="skills-count" role="status" className={`mt-2 block text-xs font-semibold ${uniqueSkills>30?"text-red-700":"text-[#806f83]"}`}>{uniqueSkills} of 30 unique skills{uniqueSkills>30?" — remove extra skills before saving":""}</span></Field>
      <Choice title="Preferred workplace" values={workplace} selected={profile.preferred_workplace} toggle={v=>toggle("preferred_workplace",v)} />
      <Choice title="Employment type" values={employment} selected={profile.preferred_employment} toggle={v=>toggle("preferred_employment",v)} />
      {hasUnsavedChanges&&<p role="status" className="text-sm font-semibold text-[#84419b]">You have unsaved changes.</p>}
      {message&&<p role="status" className="rounded-xl bg-[#f6f0f7] p-3 text-sm font-semibold">{message}</p>}
      <div className="flex flex-wrap items-center gap-3"><button disabled={saving||uniqueSkills>30||Boolean(loadError)||!hasUnsavedChanges} className="rounded-xl bg-[#28122f] px-6 py-3 font-bold text-white disabled:opacity-60">{saving?"Saving…":"Save career profile"}</button><button type="button" onClick={discardChanges} disabled={!hasUnsavedChanges||saving} className="rounded-xl border border-[#dfd0e3] px-5 py-3 font-bold disabled:opacity-50">Discard changes</button></div>
    </form>
  </div></main>;
}
function Field({label,hint,children}:{label:string;hint?:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span>{children}{hint&&<span className="mt-1 block text-xs text-[#806f83]">{hint}</span>}</label>}
function Choice({title,values,selected,toggle}:{title:string;values:string[];selected:string[];toggle:(v:string)=>void}){return <fieldset><legend className="text-sm font-bold">{title}</legend><div className="mt-3 flex flex-wrap gap-2">{values.map(v=><button type="button" key={v} aria-pressed={selected.includes(v)} onClick={()=>toggle(v)} className={`rounded-full border px-4 py-2 text-sm font-bold ${selected.includes(v)?"border-[#84419b] bg-[#f1e8f3] text-[#60346e]":"border-[#dfd0e3] bg-white"}`}>{v}</button>)}</div></fieldset>}
