"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import type { EmploymentType, ExperienceLevel, Job, WorkplaceType } from "@/lib/jobs/types";
import { formatDate, formatSalary } from "@/lib/jobs/format";
import JobActions from "./JobActions";

const workplaces: WorkplaceType[] = ["Remote", "Hybrid", "On-site"];
const employment: EmploymentType[] = ["Full-time", "Part-time", "Contract", "Internship"];
const levels: ExperienceLevel[] = ["Entry level", "Mid level", "Senior", "Lead"];

export default function JobsExplorer({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [workplace, setWorkplace] = useState<WorkplaceType[]>([]);
  const [types, setTypes] = useState<EmploymentType[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  function toggle<T,>(value: T, selected: T[], set: (value: T[]) => void) { set(selected.includes(value) ? selected.filter(x => x !== value) : [...selected, value]); }
  const visible = useMemo(() => jobs.filter(job => {
    const searchText = [job.title, job.companyName, job.location, ...job.requiredSkills, ...job.preferredSkills].join(" ").toLowerCase();
    return job.status === "open" && searchText.includes(query.trim().toLowerCase()) && job.location.toLowerCase().includes(location.trim().toLowerCase()) &&
      (!workplace.length || workplace.includes(job.workplaceType)) && (!types.length || types.includes(job.employmentType)) && (!experience.length || experience.includes(job.experienceLevel));
  }), [jobs, query, location, workplace, types, experience]);
  const active = workplace.length + types.length + experience.length;
  return <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
    <div className="relative -mt-7 grid gap-3 rounded-3xl border border-[#e8dfea] bg-white p-4 shadow-soft sm:grid-cols-[1fr_1fr_auto] sm:p-5">
      <label className="relative block"><span className="sr-only">Search job title, company or skill</span><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7891]" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Title, company or skill" className="focus-ring min-h-12 w-full rounded-xl border border-[#e2d7e5] bg-[#fcfafc] pl-11 pr-4 text-base placeholder:text-[#9a8c9d]"/></label>
      <label className="relative block"><span className="sr-only">Search location</span><MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7891]" size={18}/><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="focus-ring min-h-12 w-full rounded-xl border border-[#e2d7e5] bg-[#fcfafc] pl-11 pr-4 text-base placeholder:text-[#9a8c9d]"/></label>
      <button type="button" aria-expanded={filtersOpen} aria-controls="job-filters" onClick={()=>setFiltersOpen(!filtersOpen)} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#28122f] px-5 font-bold text-white hover:bg-[#52205f]"><SlidersHorizontal size={17}/> Filters {active > 0 && <span className="rounded-full bg-[#dfff6b] px-2 text-xs text-[#28122f]">{active}</span>}</button>
    </div>
    {filtersOpen && <div id="job-filters" className="mt-4 rounded-3xl border border-[#e8dfea] bg-white p-5 shadow-soft sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Refine your search</h2><button type="button" onClick={()=>{setWorkplace([]);setTypes([]);setExperience([])}} className="focus-ring text-sm font-bold text-[#744087] hover:underline">Clear filters</button></div><div className="mt-5 grid gap-6 md:grid-cols-3">
      <FilterGroup title="Workplace" options={workplaces} selected={workplace} onToggle={v=>toggle(v,workplace,setWorkplace)}/>
      <FilterGroup title="Employment" options={employment} selected={types} onToggle={v=>toggle(v,types,setTypes)}/>
      <FilterGroup title="Experience level" options={levels} selected={experience} onToggle={v=>toggle(v,experience,setExperience)}/>
    </div></div>}
    <div className="mb-5 mt-10 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#865095]">Browse opportunities</p><h2 className="mt-1 font-display text-3xl font-medium tracking-tight text-[#28122f]">{visible.length} {visible.length===1?"role":"roles"} to explore</h2></div><p className="text-sm font-semibold text-[#806f85]">Demonstration listings · not live jobs</p></div>
    {visible.length ? <div className="grid gap-4 lg:grid-cols-2">{visible.map(job=><article key={job.id} className="flex min-w-0 flex-col rounded-3xl border border-[#e7dce9] bg-white p-5 shadow-[0_14px_38px_rgba(37,18,46,.045)] transition hover:-translate-y-0.5 hover:shadow-soft sm:p-7">
      <div className="flex min-w-0 items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eee3f1] text-lg font-extrabold text-[#6c347e]" aria-hidden="true">{job.companyName.slice(0,1)}</div><div className="min-w-0 flex-1"><h3 className="break-words text-xl font-extrabold leading-snug text-[#28122f]">{job.title}</h3><p className="mt-1 text-sm font-bold text-[#745e7b]">{job.companyName}</p></div></div>
      <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-[#58475d]"><span className="rounded-full bg-[#f4eff5] px-3 py-1.5">{job.location}</span><span className="rounded-full bg-[#f4eff5] px-3 py-1.5">{job.workplaceType}</span><span className="rounded-full bg-[#f4eff5] px-3 py-1.5">{job.employmentType}</span></div>
      <p className="mt-5 break-words text-base leading-7 text-[#68576d]">{job.description}</p><div className="mt-4 flex flex-wrap gap-2">{job.requiredSkills.map(skill=><span key={skill} className="rounded-lg border border-[#e6dce8] px-2.5 py-1 text-xs font-bold text-[#765080]">{skill}</span>)}</div>
      <div className="mt-auto pt-6"><div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-[#eee6ef] pt-5 text-sm"><span className="min-w-0 break-words font-extrabold text-[#52205f]">{formatSalary(job)}</span><span className="text-[#89798e]">{job.experienceLevel} · Posted {formatDate(job.postedAt)}</span></div><div className="mt-5 flex flex-wrap gap-2"><Link href={`/jobs/${job.id}`} className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#dfff6b] px-4 text-sm font-extrabold text-[#28122f] hover:bg-[#d2f05e]">View Job <ArrowRight size={15}/></Link><JobActions job={job} compact/></div></div>
    </article>)}</div> : <div className="rounded-3xl border border-[#e7dce9] bg-white px-6 py-14 text-center"><BriefcaseBusiness className="mx-auto text-[#a07faa]" size={32}/><h3 className="mt-4 text-xl font-extrabold">No roles match those filters</h3><p className="mt-2 text-[#76677a]">Try a different title, skill, location, or fewer filters.</p><button onClick={()=>{setQuery("");setLocation("");setWorkplace([]);setTypes([]);setExperience([])}} className="focus-ring mt-5 inline-flex items-center gap-1 rounded-full bg-[#52205f] px-5 py-3 text-sm font-bold text-white"><X size={15}/> Clear search</button></div>}
  </div>;
}

function FilterGroup<T extends string>({title,options,selected,onToggle}:{title:string;options:readonly T[];selected:T[];onToggle:(value:T)=>void}) {
  return <fieldset><legend className="mb-3 text-sm font-extrabold text-[#49354f]">{title}</legend><div className="flex flex-wrap gap-2">{options.map(option=><label key={option} className={`focus-within:ring-2 focus-within:ring-[#9a62aa] cursor-pointer rounded-full border px-3 py-2 text-sm font-bold transition ${selected.includes(option)?"border-[#52205f] bg-[#52205f] text-white":"border-[#e1d6e3] bg-[#fcfafc] text-[#65546b] hover:border-[#ae8cb7]"}`}><input type="checkbox" className="sr-only" checked={selected.includes(option)} onChange={()=>onToggle(option)}/>{option}</label>)}</div></fieldset>;
}
