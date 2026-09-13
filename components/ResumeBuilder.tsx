"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Trash2, ArrowRight, ArrowLeft, Download, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ResumeData, WorkExperience, EducationEntry } from "@/lib/types";

const STEPS = ["Personal", "Experience", "Education", "Skills", "Preview"];
const emptyExp = (): WorkExperience => ({ id: crypto.randomUUID(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] });
const emptyEdu = (): EducationEntry => ({ id: crypto.randomUUID(), degree: "", institution: "", location: "", startYear: "", endYear: "", description: "" });

function resumeToText(d: ResumeData) {
  let out = `${d.fullName}\n${d.jobTitle}\n${[d.email, d.phone, d.location].filter(Boolean).join(" | ")}\n${[d.linkedin, d.website].filter(Boolean).join(" | ")}\n\n`;
  if (d.summary.trim()) out += `SUMMARY\n${d.summary}\n\n`;
  if (d.experience.length) {
    out += "EXPERIENCE\n";
    for (const e of d.experience) {
      out += `${e.jobTitle} — ${e.company}${e.location ? ", " + e.location : ""} (${e.startDate} - ${e.current ? "Present" : e.endDate})\n`;
      for (const b of e.bullets) if (b.trim()) out += `- ${b}\n`;
      out += "\n";
    }
  }
  if (d.education.length) {
    out += "EDUCATION\n";
    for (const ed of d.education) {
      out += `${ed.degree}, ${ed.institution}${ed.location ? ", " + ed.location : ""} (${ed.startYear} - ${ed.endYear})\n`;
      if (ed.description.trim()) out += `${ed.description}\n`;
      out += "\n";
    }
  }
  if (d.skills.length) out += `SKILLS\n${d.skills.join(", ")}\n`;
  return out.trim();
}

const inputCls = "focus-ring w-full rounded-xl border border-[#dfd4e1] bg-white p-3 text-base placeholder:text-[#aa9fae]";
const labelCls = "mb-1.5 block text-sm font-bold text-[#4a354f]";

export default function ResumeBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>({
    fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", website: "",
    summary: "", experience: [], education: [], skills: []
  });
  const [skillInput, setSkillInput] = useState("");

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData(d => ({ ...d, [key]: value }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !data.skills.includes(s)) update("skills", [...data.skills, s]);
    setSkillInput("");
  }

  async function downloadPdf() {
    const { pdf, Document, Page, Text, StyleSheet } = await import("@react-pdf/renderer");
    const styles = StyleSheet.create({ page: { padding: 50, fontFamily: "Helvetica", fontSize: 10.5, lineHeight: 1.55, color: "#25162c" }, title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 18, color: "#6d347f" }, text: { whiteSpace: "pre-wrap" } });
    const text = resumeToText(data);
    const doc = <Document><Page size="A4" style={styles.page}><Text style={styles.title}>{data.fullName || "Resume"}</Text><Text style={styles.text}>{text}</Text></Page></Document>;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${(data.fullName || "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`; a.click(); URL.revokeObjectURL(url);
  }

  return <>
    <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
      <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-[-.04em] text-[#24152b]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#52205f] text-[#dfff6b]"><FileText size={18}/></span>TailorMyResume</Link>
    </header>

    <main className="mx-auto max-w-3xl px-5 pb-24">
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold ${i <= step ? "bg-[#52205f] text-white" : "bg-[#eee8ef] text-[#a695ab]"}`}>{i + 1}</div>
              <span className={`text-xs font-bold ${i <= step ? "text-[#52205f]" : "text-[#a695ab]"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-[#52205f]" : "bg-[#eee8ef]"}`}/>}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#e3d9e6] bg-white p-5 shadow-soft sm:p-8">

        {step === 0 && <div className="space-y-4">
          <h2 className="mb-2 text-xl font-extrabold">Personal Details</h2>
          <div><label className={labelCls}>Full name</label><input className={inputCls} value={data.fullName} onChange={e=>update("fullName", e.target.value)} placeholder="Jordan Lee"/></div>
          <div><label className={labelCls}>Professional title</label><input className={inputCls} value={data.jobTitle} onChange={e=>update("jobTitle", e.target.value)} placeholder="Frontend Developer"/></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Email</label><input className={inputCls} value={data.email} onChange={e=>update("email", e.target.value)} placeholder="jordan@email.com"/></div>
            <div><label className={labelCls}>Phone</label><input className={inputCls} value={data.phone} onChange={e=>update("phone", e.target.value)} placeholder="(555) 123-4567"/></div>
          </div>
          <div><label className={labelCls}>City / Location</label><input className={inputCls} value={data.location} onChange={e=>update("location", e.target.value)} placeholder="Austin, TX"/></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>LinkedIn</label><input className={inputCls} value={data.linkedin} onChange={e=>update("linkedin", e.target.value)} placeholder="linkedin.com/in/jordan"/></div>
            <div><label className={labelCls}>Portfolio / Website</label><input className={inputCls} value={data.website} onChange={e=>update("website", e.target.value)} placeholder="jordan.dev"/></div>
          </div>
          <div><label className={labelCls}>Professional summary</label><textarea className={`${inputCls} min-h-28 resize-y`} value={data.summary} onChange={e=>update("summary", e.target.value)} placeholder="A brief 2-3 sentence summary of your experience and strengths…"/></div>
        </div>}

        {step === 1 && <div className="space-y-5">
          <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Work Experience</h2><button onClick={()=>update("experience", [...data.experience, emptyExp()])} className="flex items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-2 text-sm font-bold text-[#52205f]"><Plus size={16}/>Add</button></div>
          {data.experience.length === 0 && <p className="text-sm text-[#8a798e]">No experience added yet. Tap "Add" to include a job.</p>}
          {data.experience.map((exp, i) => (
            <div key={exp.id} className="rounded-2xl border border-[#e3d9e6] p-4 space-y-3">
              <div className="flex justify-end"><button onClick={()=>update("experience", data.experience.filter(x=>x.id!==exp.id))} className="text-[#8d7d91]"><Trash2 size={17}/></button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputCls} value={exp.jobTitle} onChange={e=>{const n=[...data.experience]; n[i]={...exp, jobTitle:e.target.value}; update("experience", n);}} placeholder="Job title"/>
                <input className={inputCls} value={exp.company} onChange={e=>{const n=[...data.experience]; n[i]={...exp, company:e.target.value}; update("experience", n);}} placeholder="Company"/>
              </div>
              <input className={inputCls} value={exp.location} onChange={e=>{const n=[...data.experience]; n[i]={...exp, location:e.target.value}; update("experience", n);}} placeholder="Location"/>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputCls} value={exp.startDate} onChange={e=>{const n=[...data.experience]; n[i]={...exp, startDate:e.target.value}; update("experience", n);}} placeholder="Start date (e.g. Jan 2021)"/>
                <input className={inputCls} value={exp.endDate} disabled={exp.current} onChange={e=>{const n=[...data.experience]; n[i]={...exp, endDate:e.target.value}; update("experience", n);}} placeholder="End date" />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#4a354f]"><input type="checkbox" checked={exp.current} onChange={e=>{const n=[...data.experience]; n[i]={...exp, current:e.target.checked}; update("experience", n);}}/>I currently work here</label>
              <div className="space-y-2">
                <label className={labelCls}>Responsibilities / achievements</label>
                {exp.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-2">
                    <input className={inputCls} value={b} onChange={e=>{const n=[...data.experience]; const nb=[...exp.bullets]; nb[bi]=e.target.value; n[i]={...exp, bullets:nb}; update("experience", n);}} placeholder="Led a team of 5 engineers…"/>
                    <button onClick={()=>{const n=[...data.experience]; const nb=exp.bullets.filter((_,x)=>x!==bi); n[i]={...exp, bullets:nb.length?nb:[""]}; update("experience", n);}} className="text-[#8d7d91]"><X size={18}/></button>
                  </div>
                ))}
                <button onClick={()=>{const n=[...data.experience]; n[i]={...exp, bullets:[...exp.bullets, ""]}; update("experience", n);}} className="text-sm font-bold text-[#8b499f]">+ Add bullet</button>
              </div>
            </div>
          ))}
        </div>}

        {step === 2 && <div className="space-y-5">
          <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Education</h2><button onClick={()=>update("education", [...data.education, emptyEdu()])} className="flex items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-2 text-sm font-bold text-[#52205f]"><Plus size={16}/>Add</button></div>
          {data.education.length === 0 && <p className="text-sm text-[#8a798e]">No education added yet.</p>}
          {data.education.map((ed, i) => (
            <div key={ed.id} className="rounded-2xl border border-[#e3d9e6] p-4 space-y-3">
              <div className="flex justify-end"><button onClick={()=>update("education", data.education.filter(x=>x.id!==ed.id))} className="text-[#8d7d91]"><Trash2 size={17}/></button></div>
              <input className={inputCls} value={ed.degree} onChange={e=>{const n=[...data.education]; n[i]={...ed, degree:e.target.value}; update("education", n);}} placeholder="Degree / Course (e.g. B.S. Computer Science)"/>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputCls} value={ed.institution} onChange={e=>{const n=[...data.education]; n[i]={...ed, institution:e.target.value}; update("education", n);}} placeholder="Institution"/>
                <input className={inputCls} value={ed.location} onChange={e=>{const n=[...data.education]; n[i]={...ed, location:e.target.value}; update("education", n);}} placeholder="Location"/>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputCls} value={ed.startYear} onChange={e=>{const n=[...data.education]; n[i]={...ed, startYear:e.target.value}; update("education", n);}} placeholder="Start year"/>
                <input className={inputCls} value={ed.endYear} onChange={e=>{const n=[...data.education]; n[i]={...ed, endYear:e.target.value}; update("education", n);}} placeholder="End year"/>
              </div>
              <textarea className={`${inputCls} min-h-20 resize-y`} value={ed.description} onChange={e=>{const n=[...data.education]; n[i]={...ed, description:e.target.value}; update("education", n);}} placeholder="Optional: relevant coursework, honors, GPA…"/>
            </div>
          ))}
        </div>}

        {step === 3 && <div>
          <h2 className="mb-4 text-xl font-extrabold">Skills</h2>
          <div className="flex gap-2">
            <input className={inputCls} value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault(); addSkill();}}} placeholder="Type a skill and press Enter"/>
            <button onClick={addSkill} className="rounded-xl bg-[#52205f] px-5 font-bold text-white">Add</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.skills.map(s => <span key={s} className="flex items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-1.5 text-sm font-bold text-[#52205f]">{s}<button onClick={()=>update("skills", data.skills.filter(x=>x!==s))}><X size={14}/></button></span>)}
          </div>
        </div>}

        {step === 4 && <div>
          <h2 className="mb-4 text-xl font-extrabold">Preview</h2>
          <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-2xl border border-[#dfd4e1] bg-[#fcfafc] p-5 font-sans text-[15px] leading-7 text-[#3c2842]">{resumeToText(data)}</pre>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button onClick={downloadPdf} className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#52205f] px-6 py-3.5 font-extrabold text-[#52205f]"><Download size={17}/>Download PDF</button>
            <button onClick={()=>{sessionStorage.setItem("tmr-prefill-resume", resumeToText(data)); router.push("/tailor");}} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#52205f] px-6 py-3.5 font-extrabold text-white"><Sparkles size={17}/>Tailor this resume</button>
          </div>
        </div>}

        <div className="mt-7 flex justify-between">
          <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} className="flex items-center gap-1.5 rounded-full border-2 border-[#52205f] px-5 py-2.5 font-bold text-[#52205f] disabled:opacity-30"><ArrowLeft size={16}/>Back</button>
          {step < STEPS.length - 1 && <button onClick={()=>setStep(s=>s+1)} className="flex items-center gap-1.5 rounded-full bg-[#52205f] px-5 py-2.5 font-bold text-white">Continue<ArrowRight size={16}/></button>}
        </div>
      </div>
    </main>
  </>;
}
