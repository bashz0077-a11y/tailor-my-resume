"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Trash2, ArrowRight, ArrowLeft, Download, X, Sparkles, User, Briefcase, GraduationCap, ListChecks, FolderKanban, Award, Languages as LangIcon, Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import type { ResumeData, WorkExperience, EducationEntry, ProjectEntry, CertificationEntry, LanguageEntry } from "@/lib/types";

const STEPS = ["Personal", "Experience", "Education", "Skills", "Additional", "Preview"];
const emptyExp = (): WorkExperience => ({ id: crypto.randomUUID(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] });
const emptyEdu = (): EducationEntry => ({ id: crypto.randomUUID(), degree: "", institution: "", location: "", startYear: "", endYear: "", description: "" });
const emptyProject = (): ProjectEntry => ({ id: crypto.randomUUID(), name: "", description: "", technologies: "", link: "" });
const emptyCert = (): CertificationEntry => ({ id: crypto.randomUUID(), name: "", issuer: "", year: "" });
const emptyLang = (): LanguageEntry => ({ id: crypto.randomUUID(), name: "", level: "" });

function formatMonthYear(v: string) {
  if (!v) return "";
  const [y, m] = v.split("-");
  if (!y || !m) return v;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const idx = parseInt(m, 10) - 1;
  return months[idx] ? `${months[idx]} ${y}` : v;
}

function resumeToText(d: ResumeData) {
  let out = `${d.fullName}\n${d.jobTitle}\n${[d.email, d.phone, d.location].filter(Boolean).join(" | ")}\n${[d.linkedin, d.website].filter(Boolean).join(" | ")}\n\n`;
  if (d.summary.trim()) out += `SUMMARY\n${d.summary}\n\n`;
  if (d.experience.length) {
    out += "EXPERIENCE\n";
    for (const e of d.experience) {
      out += `${e.jobTitle} — ${e.company}${e.location ? ", " + e.location : ""} (${formatMonthYear(e.startDate)} - ${e.current ? "Present" : formatMonthYear(e.endDate)})\n`;
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
  if (d.skills.length) out += `SKILLS\n${d.skills.join(", ")}\n\n`;
  if (d.projects.length) {
    out += "PROJECTS\n";
    for (const p of d.projects) {
      out += `${p.name}${p.technologies ? " — " + p.technologies : ""}\n`;
      if (p.description.trim()) out += `${p.description}\n`;
      if (p.link.trim()) out += `${p.link}\n`;
      out += "\n";
    }
  }
  if (d.certifications.length) {
    out += "CERTIFICATIONS\n";
    for (const c of d.certifications) out += `${c.name}${c.issuer ? ", " + c.issuer : ""}${c.year ? " (" + c.year + ")" : ""}\n`;
    out += "\n";
  }
  if (d.languages.length) {
    out += "LANGUAGES\n";
    out += d.languages.map(l => `${l.name}${l.level ? " (" + l.level + ")" : ""}`).join(", ") + "\n";
  }
  return out.trim();
}

const inputCls = "focus-ring w-full rounded-xl border border-[#dfd4e1] bg-white p-3 text-base placeholder:text-[#aa9fae]";
const labelCls = "mb-1.5 block text-sm font-bold text-[#4a354f]";

function SectionHeading({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return <div className="mb-5 flex items-center gap-3">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0e7f2] text-[#52205f]">{icon}</span>
    <div><h2 className="text-xl font-extrabold text-[#28122f]">{title}</h2>{hint && <p className="text-sm text-[#8a798e]">{hint}</p>}</div>
  </div>;
}

function ResumePreview({ d }: { d: ResumeData }) {
  return <div className="rounded-2xl border border-[#dfd4e1] bg-white p-6 sm:p-9 shadow-soft">
    <div className="border-b-2 border-[#52205f] pb-5 mb-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#28122f]">{d.fullName || "Your Name"}</h1>
      {d.jobTitle && <p className="mt-1 text-lg font-semibold text-[#8b499f]">{d.jobTitle}</p>}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#5c4d60]">
        {d.email && <span className="flex items-center gap-1.5"><Mail size={13}/>{d.email}</span>}
        {d.phone && <span className="flex items-center gap-1.5"><Phone size={13}/>{d.phone}</span>}
        {d.location && <span className="flex items-center gap-1.5"><MapPin size={13}/>{d.location}</span>}
        {d.linkedin && <span className="flex items-center gap-1.5"><Linkedin size={13}/>{d.linkedin}</span>}
        {d.website && <span className="flex items-center gap-1.5"><Globe size={13}/>{d.website}</span>}
      </div>
    </div>

    {d.summary.trim() && <div className="mb-6"><p className="text-[15px] leading-7 text-[#3c2842]">{d.summary}</p></div>}

    {d.experience.length > 0 && <div className="mb-6">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[.15em] text-[#52205f]">Experience</h3>
      <div className="space-y-4">
        {d.experience.map(e => <div key={e.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="font-bold text-[#28122f]">{e.jobTitle}{e.company && <span className="font-medium text-[#5c4d60]"> — {e.company}</span>}</p>
            <p className="text-sm text-[#8a798e]">{formatMonthYear(e.startDate)}{(e.startDate || e.endDate || e.current) && " – "}{e.current ? "Present" : formatMonthYear(e.endDate)}</p>
          </div>
          {e.location && <p className="text-sm text-[#8a798e]">{e.location}</p>}
          {e.bullets.filter(b=>b.trim()).length > 0 && <ul className="mt-1.5 space-y-1 pl-4">{e.bullets.filter(b=>b.trim()).map((b,i) => <li key={i} className="list-disc text-[15px] leading-6 text-[#3c2842]">{b}</li>)}</ul>}
        </div>)}
      </div>
    </div>}

    {d.education.length > 0 && <div className="mb-6">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[.15em] text-[#52205f]">Education</h3>
      <div className="space-y-3">
        {d.education.map(ed => <div key={ed.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="font-bold text-[#28122f]">{ed.degree}</p>
            <p className="text-sm text-[#8a798e]">{ed.startYear}{(ed.startYear || ed.endYear) && " – "}{ed.endYear}</p>
          </div>
          <p className="text-sm text-[#5c4d60]">{ed.institution}{ed.location && `, ${ed.location}`}</p>
          {ed.description.trim() && <p className="mt-1 text-sm leading-6 text-[#3c2842]">{ed.description}</p>}
        </div>)}
      </div>
    </div>}

    {d.skills.length > 0 && <div className="mb-6">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[.15em] text-[#52205f]">Skills</h3>
      <div className="flex flex-wrap gap-2">{d.skills.map(s => <span key={s} className="rounded-full bg-[#f0e7f2] px-3 py-1 text-sm font-semibold text-[#52205f]">{s}</span>)}</div>
    </div>}

    {d.projects.length > 0 && <div className="mb-6">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[.15em] text-[#52205f]">Projects</h3>
      <div className="space-y-3">
        {d.projects.map(p => <div key={p.id}>
          <p className="font-bold text-[#28122f]">{p.name}{p.technologies && <span className="font-medium text-[#8a798e]"> — {p.technologies}</span>}</p>
          {p.description.trim() && <p className="text-sm leading-6 text-[#3c2842]">{p.description}</p>}
          {p.link.trim() && <p className="text-sm text-[#8b499f]">{p.link}</p>}
        </div>)}
      </div>
    </div>}

    {d.certifications.length > 0 && <div className="mb-6">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[.15em] text-[#52205f]">Certifications</h3>
      <div className="space-y-1">{d.certifications.map(c => <p key={c.id} className="text-[15px] text-[#3c2842]"><span className="font-bold">{c.name}</span>{c.issuer && `, ${c.issuer}`}{c.year && ` (${c.year})`}</p>)}</div>
    </div>}

    {d.languages.length > 0 && <div>
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[.15em] text-[#52205f]">Languages</h3>
      <p className="text-[15px] text-[#3c2842]">{d.languages.map(l => `${l.name}${l.level ? " (" + l.level + ")" : ""}`).join("  •  ")}</p>
    </div>}
  </div>;
}

export default function ResumeBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>({
    fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", website: "",
    summary: "", experience: [], education: [], skills: [], projects: [], certifications: [], languages: []
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
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");
    const c = { ink: "#25162c", accent: "#6d347f", sub: "#6b5a70" };
    const s = StyleSheet.create({
      page: { padding: 42, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.45, color: c.ink },
      name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: c.ink },
      title: { fontSize: 12, fontFamily: "Helvetica-Bold", color: c.accent, marginTop: 2 },
      contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8, marginBottom: 12, fontSize: 9, color: c.sub },
      hr: { borderBottomWidth: 1.5, borderBottomColor: c.accent, marginBottom: 14 },
      sectionTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: c.accent, marginBottom: 6, marginTop: 12, letterSpacing: 1 },
      row: { flexDirection: "row", justifyContent: "space-between" },
      bold: { fontFamily: "Helvetica-Bold" },
      dim: { color: c.sub, fontSize: 9 },
      bullet: { flexDirection: "row", marginTop: 2, paddingLeft: 4 },
      bulletDot: { width: 10 },
      para: { marginTop: 3 },
      block: { marginBottom: 8 },
    });
    const contact = [data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean);
    const doc = <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{data.fullName || "Your Name"}</Text>
        {!!data.jobTitle && <Text style={s.title}>{data.jobTitle}</Text>}
        {contact.length > 0 && <View style={s.contactRow}>{contact.map((cc, i) => <Text key={i}>{cc}</Text>)}</View>}
        <View style={s.hr} />
        {data.summary.trim() && <View style={s.block}><Text>{data.summary}</Text></View>}
        {data.experience.length > 0 && <View>
          <Text style={s.sectionTitle}>EXPERIENCE</Text>
          {data.experience.map(e => <View key={e.id} style={s.block}>
            <View style={s.row}><Text style={s.bold}>{e.jobTitle}{e.company ? ` — ${e.company}` : ""}</Text><Text style={s.dim}>{formatMonthYear(e.startDate)}{(e.startDate || e.endDate || e.current) ? " - " : ""}{e.current ? "Present" : formatMonthYear(e.endDate)}</Text></View>
            {!!e.location && <Text style={s.dim}>{e.location}</Text>}
            {e.bullets.filter(b => b.trim()).map((b, i) => <View key={i} style={s.bullet}><Text style={s.bulletDot}>•</Text><Text>{b}</Text></View>)}
          </View>)}
        </View>}
        {data.education.length > 0 && <View>
          <Text style={s.sectionTitle}>EDUCATION</Text>
          {data.education.map(ed => <View key={ed.id} style={s.block}>
            <View style={s.row}><Text style={s.bold}>{ed.degree}</Text><Text style={s.dim}>{ed.startYear}{(ed.startYear || ed.endYear) ? " - " : ""}{ed.endYear}</Text></View>
            <Text style={s.dim}>{ed.institution}{ed.location ? `, ${ed.location}` : ""}</Text>
            {!!ed.description.trim() && <Text style={s.para}>{ed.description}</Text>}
          </View>)}
        </View>}
        {data.skills.length > 0 && <View><Text style={s.sectionTitle}>SKILLS</Text><Text>{data.skills.join("   •   ")}</Text></View>}
        {data.projects.length > 0 && <View>
          <Text style={s.sectionTitle}>PROJECTS</Text>
          {data.projects.map(p => <View key={p.id} style={s.block}>
            <Text style={s.bold}>{p.name}{p.technologies ? ` — ${p.technologies}` : ""}</Text>
            {!!p.description.trim() && <Text style={s.para}>{p.description}</Text>}
            {!!p.link.trim() && <Text style={[s.para, s.dim]}>{p.link}</Text>}
          </View>)}
        </View>}
        {data.certifications.length > 0 && <View>
          <Text style={s.sectionTitle}>CERTIFICATIONS</Text>
          {data.certifications.map(cert => <Text key={cert.id} style={s.para}><Text style={s.bold}>{cert.name}</Text>{cert.issuer ? `, ${cert.issuer}` : ""}{cert.year ? ` (${cert.year})` : ""}</Text>)}
        </View>}
        {data.languages.length > 0 && <View>
          <Text style={s.sectionTitle}>LANGUAGES</Text>
          <Text>{data.languages.map(l => `${l.name}${l.level ? " (" + l.level + ")" : ""}`).join("   •   ")}</Text>
        </View>}
      </Page>
    </Document>;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${(data.fullName || "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`; a.click(); URL.revokeObjectURL(url);
  }

  return <>
    <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
      <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-[-.04em] text-[#24152b]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#52205f] text-[#dfff6b]"><FileText size={18}/></span>TailorMyResume</Link>
    </header>

    <main className="mx-auto max-w-3xl px-5 pb-24">
      <div className="mb-8 flex items-center justify-between overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center min-w-[52px]">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold transition ${i <= step ? "bg-[#52205f] text-white" : "bg-[#eee8ef] text-[#a695ab]"}`}>{i + 1}</div>
              <span className={`text-xs font-bold ${i <= step ? "text-[#52205f]" : "text-[#a695ab]"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 transition ${i < step ? "bg-[#52205f]" : "bg-[#eee8ef]"}`}/>}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#e3d9e6] bg-white p-5 shadow-soft sm:p-8">

        {step === 0 && <div className="space-y-4">
          <SectionHeading icon={<User size={19}/>} title="Personal Details" hint="How employers will identify and reach you" />
          <div><label className={labelCls}>Full name</label><input className={inputCls} value={data.fullName} onChange={e=>update("fullName", e.target.value)} placeholder="Jordan Lee"/></div>
          <div><label className={labelCls}>Professional title</label><input className={inputCls} value={data.jobTitle} onChange={e=>update("jobTitle", e.target.value)} placeholder="Senior Frontend Engineer"/></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Email</label><input className={inputCls} value={data.email} onChange={e=>update("email", e.target.value)} placeholder="jordan@email.com"/></div>
            <div><label className={labelCls}>Phone</label><input className={inputCls} value={data.phone} onChange={e=>update("phone", e.target.value)} placeholder="(555) 123-4567"/></div>
          </div>
          <div><label className={labelCls}>City / Location</label><input className={inputCls} value={data.location} onChange={e=>update("location", e.target.value)} placeholder="Austin, TX"/></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>LinkedIn</label><input className={inputCls} value={data.linkedin} onChange={e=>update("linkedin", e.target.value)} placeholder="linkedin.com/in/jordan"/></div>
            <div><label className={labelCls}>Portfolio / Website</label><input className={inputCls} value={data.website} onChange={e=>update("website", e.target.value)} placeholder="jordan.dev"/></div>
          </div>
          <div><label className={labelCls}>Professional summary</label><textarea className={`${inputCls} min-h-28 resize-y`} value={data.summary} onChange={e=>update("summary", e.target.value)} placeholder="2-3 sentences: your role, years of experience, and a standout strength or achievement."/></div>
        </div>}

        {step === 1 && <div className="space-y-5">
          <div className="flex items-center justify-between"><SectionHeading icon={<Briefcase size={19}/>} title="Work Experience" hint="Most recent role first" /><button onClick={()=>update("experience", [...data.experience, emptyExp()])} className="flex h-fit items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-2 text-sm font-bold text-[#52205f]"><Plus size={16}/>Add</button></div>
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
                <div><label className={labelCls}>Start date</label><input type="month" className={inputCls} value={exp.startDate} onChange={e=>{const n=[...data.experience]; n[i]={...exp, startDate:e.target.value}; update("experience", n);}}/></div>
                <div><label className={labelCls}>End date</label><input type="month" className={inputCls} value={exp.endDate} disabled={exp.current} onChange={e=>{const n=[...data.experience]; n[i]={...exp, endDate:e.target.value}; update("experience", n);}}/></div>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#4a354f]"><input type="checkbox" checked={exp.current} onChange={e=>{const n=[...data.experience]; n[i]={...exp, current:e.target.checked}; update("experience", n);}}/>I currently work here</label>
              <div className="space-y-2">
                <label className={labelCls}>Responsibilities / achievements</label>
                {exp.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-2">
                    <input className={inputCls} value={b} onChange={e=>{const n=[...data.experience]; const nb=[...exp.bullets]; nb[bi]=e.target.value; n[i]={...exp, bullets:nb}; update("experience", n);}} placeholder="Led a team of 5 engineers, shipped X, improved Y by Z%…"/>
                    <button onClick={()=>{const n=[...data.experience]; const nb=exp.bullets.filter((_,x)=>x!==bi); n[i]={...exp, bullets:nb.length?nb:[""]}; update("experience", n);}} className="text-[#8d7d91]"><X size={18}/></button>
                  </div>
                ))}
                <button onClick={()=>{const n=[...data.experience]; n[i]={...exp, bullets:[...exp.bullets, ""]}; update("experience", n);}} className="text-sm font-bold text-[#8b499f]">+ Add bullet</button>
              </div>
            </div>
          ))}
        </div>}

        {step === 2 && <div className="space-y-5">
          <div className="flex items-center justify-between"><SectionHeading icon={<GraduationCap size={19}/>} title="Education" /><button onClick={()=>update("education", [...data.education, emptyEdu()])} className="flex h-fit items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-2 text-sm font-bold text-[#52205f]"><Plus size={16}/>Add</button></div>
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
                <div><label className={labelCls}>Start year</label><input type="number" inputMode="numeric" min="1960" max="2100" className={inputCls} value={ed.startYear} onChange={e=>{const n=[...data.education]; n[i]={...ed, startYear:e.target.value}; update("education", n);}} placeholder="2018"/></div>
                <div><label className={labelCls}>End year</label><input type="number" inputMode="numeric" min="1960" max="2100" className={inputCls} value={ed.endYear} onChange={e=>{const n=[...data.education]; n[i]={...ed, endYear:e.target.value}; update("education", n);}} placeholder="2022"/></div>
              </div>
              <textarea className={`${inputCls} min-h-20 resize-y`} value={ed.description} onChange={e=>{const n=[...data.education]; n[i]={...ed, description:e.target.value}; update("education", n);}} placeholder="Optional: relevant coursework, honors, GPA…"/>
            </div>
          ))}
        </div>}

        {step === 3 && <div>
          <SectionHeading icon={<ListChecks size={19}/>} title="Skills" />
          <div className="flex gap-2">
            <input className={inputCls} value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault(); addSkill();}}} placeholder="Type a skill and press Enter"/>
            <button onClick={addSkill} className="rounded-xl bg-[#52205f] px-5 font-bold text-white">Add</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.skills.map(s => <span key={s} className="flex items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-1.5 text-sm font-bold text-[#52205f]">{s}<button onClick={()=>update("skills", data.skills.filter(x=>x!==s))}><X size={14}/></button></span>)}
          </div>
        </div>}

        {step === 4 && <div className="space-y-9">
          <div className="space-y-5">
            <div className="flex items-center justify-between"><SectionHeading icon={<FolderKanban size={19}/>} title="Projects" hint="Optional" /><button onClick={()=>update("projects", [...data.projects, emptyProject()])} className="flex h-fit items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-2 text-sm font-bold text-[#52205f]"><Plus size={16}/>Add</button></div>
            {data.projects.map((p, i) => (
              <div key={p.id} className="rounded-2xl border border-[#e3d9e6] p-4 space-y-3">
                <div className="flex justify-end"><button onClick={()=>update("projects", data.projects.filter(x=>x.id!==p.id))} className="text-[#8d7d91]"><Trash2 size={17}/></button></div>
                <input className={inputCls} value={p.name} onChange={e=>{const n=[...data.projects]; n[i]={...p, name:e.target.value}; update("projects", n);}} placeholder="Project name"/>
                <textarea className={`${inputCls} min-h-16 resize-y`} value={p.description} onChange={e=>{const n=[...data.projects]; n[i]={...p, description:e.target.value}; update("projects", n);}} placeholder="What it does, your role, the outcome…"/>
                <input className={inputCls} value={p.technologies} onChange={e=>{const n=[...data.projects]; n[i]={...p, technologies:e.target.value}; update("projects", n);}} placeholder="Technologies used (e.g. React, Node.js, PostgreSQL)"/>
                <input className={inputCls} value={p.link} onChange={e=>{const n=[...data.projects]; n[i]={...p, link:e.target.value}; update("projects", n);}} placeholder="Link (optional)"/>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between"><SectionHeading icon={<Award size={19}/>} title="Certifications" hint="Optional" /><button onClick={()=>update("certifications", [...data.certifications, emptyCert()])} className="flex h-fit items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-2 text-sm font-bold text-[#52205f]"><Plus size={16}/>Add</button></div>
            {data.certifications.map((c, i) => (
              <div key={c.id} className="rounded-2xl border border-[#e3d9e6] p-4 space-y-3">
                <div className="flex justify-end"><button onClick={()=>update("certifications", data.certifications.filter(x=>x.id!==c.id))} className="text-[#8d7d91]"><Trash2 size={17}/></button></div>
                <input className={inputCls} value={c.name} onChange={e=>{const n=[...data.certifications]; n[i]={...c, name:e.target.value}; update("certifications", n);}} placeholder="Certification name"/>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputCls} value={c.issuer} onChange={e=>{const n=[...data.certifications]; n[i]={...c, issuer:e.target.value}; update("certifications", n);}} placeholder="Issuing organization"/>
                  <input type="number" inputMode="numeric" min="1960" max="2100" className={inputCls} value={c.year} onChange={e=>{const n=[...data.certifications]; n[i]={...c, year:e.target.value}; update("certifications", n);}} placeholder="Year"/>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between"><SectionHeading icon={<LangIcon size={19}/>} title="Languages" hint="Optional" /><button onClick={()=>update("languages", [...data.languages, emptyLang()])} className="flex h-fit items-center gap-1.5 rounded-full bg-[#f0e7f2] px-3 py-2 text-sm font-bold text-[#52205f]"><Plus size={16}/>Add</button></div>
            {data.languages.map((l, i) => (
              <div key={l.id} className="flex gap-3">
                <input className={inputCls} value={l.name} onChange={e=>{const n=[...data.languages]; n[i]={...l, name:e.target.value}; update("languages", n);}} placeholder="Language"/>
                <select className={inputCls} value={l.level} onChange={e=>{const n=[...data.languages]; n[i]={...l, level:e.target.value}; update("languages", n);}}>
                  <option value="">Proficiency level</option>
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
                <button onClick={()=>update("languages", data.languages.filter(x=>x.id!==l.id))} className="text-[#8d7d91]"><Trash2 size={17}/></button>
              </div>
            ))}
          </div>
        </div>}

        {step === 5 && <div>
          <SectionHeading icon={<Sparkles size={19}/>} title="Preview" hint="This is how your resume will look" />
          <ResumePreview d={data} />
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
