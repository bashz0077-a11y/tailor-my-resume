import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin } from "lucide-react";
import JobsNav from "@/components/jobs/JobsNav";
import JobActions from "@/components/jobs/JobActions";
import { getOpenJob } from "@/lib/jobs/supabase-jobs";
import { formatDate, formatSalary } from "@/lib/jobs/format";

type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getOpenJob((await params).id);
  return { title: job ? `${job.title} at ${job.companyName} | TailorMyResume` : "Job not found | TailorMyResume" };
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getOpenJob((await params).id);
  if (!job) notFound();
  return <><JobsNav/><main className="min-h-screen overflow-x-hidden bg-[#fbfaf7]"><div className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-10">
    <Link href="/jobs" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded text-sm font-bold text-[#744087] hover:underline"><ArrowLeft size={17}/> All jobs</Link>
    <div className="mt-5 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:items-start">
      <div className="min-w-0 space-y-6"><header className="min-w-0 rounded-3xl border border-[#e6dce8] bg-white p-6 shadow-soft sm:p-9"><span className="inline-flex rounded-full bg-[#e9f8bc] px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#3f4c18]">Actively hiring</span><h1 className="mt-5 break-words font-display text-4xl font-medium leading-tight tracking-[-.03em] text-[#28122f] sm:text-5xl">{job.title}</h1><p className="mt-2 text-lg font-extrabold text-[#744087]">{job.companyName}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#66576b]"><span className="inline-flex items-center gap-1.5"><MapPin size={16}/>{job.location}</span><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={16}/>{job.workplaceType} · {job.employmentType}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={16}/>Posted {formatDate(job.postedAt)}</span></div><div className="mt-6 grid gap-3 border-t border-[#eee6ef] pt-6 text-sm sm:grid-cols-2"><DetailFact label="Salary" value={formatSalary(job)}/><DetailFact label="Experience" value={job.experienceLevel}/><DetailFact label="Application deadline" value={formatDate(job.expiresAt)}/><DetailFact label="Workplace" value={job.workplaceType}/></div></header>
        <section className="rounded-3xl border border-[#e6dce8] bg-white p-6 sm:p-9"><h2 className="font-display text-3xl font-medium">About the Job</h2><p className="mt-4 break-words text-base leading-8 text-[#63536a]">{job.description}</p></section>
        <ListSection title="Responsibilities" items={job.responsibilities}/><ListSection title="Required Skills" items={job.requiredSkills} tags/><ListSection title="Preferred Skills" items={job.preferredSkills} tags/><ListSection title="Requirements" items={job.requirements}/><ListSection title="Education requirements" items={job.educationRequirements}/><ListSection title="Salary & Benefits" items={[formatSalary(job), ...job.benefits]}/>
        <section className="rounded-3xl border border-[#e6dce8] bg-white p-6 sm:p-9"><h2 className="font-display text-3xl font-medium">About the Company</h2><p className="mt-4 break-words text-base leading-8 text-[#63536a]">{job.companyDescription}</p></section>
      </div>
      <aside className="min-w-0 lg:sticky lg:top-6"><div className="rounded-3xl bg-[#28122f] p-6 text-white shadow-soft sm:p-8"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[#dfff6b] text-[#28122f]"><BriefcaseBusiness size={22}/></div><h2 className="font-display text-3xl font-medium">Resume Match</h2><p className="mt-3 text-base leading-7 text-[#e0d4e4]">Check how your resume matches this job.</p><p className="mt-2 text-sm leading-6 text-[#bfaec5]">Your existing Tailor Resume workspace opens with this job description filled in.</p><div className="mt-6 [&_button]:w-full [&_a]:w-full"><JobActions job={job}/></div></div></aside>
    </div>
  </div></main></>;
}

function DetailFact({label,value}:{label:string;value:string}) { return <div className="min-w-0"><dt className="font-bold text-[#8d7d91]">{label}</dt><dd className="mt-1 break-words font-extrabold text-[#3a2840]">{value}</dd></div>; }
function ListSection({title,items,tags=false}:{title:string;items:string[];tags?:boolean}) { if (!items.length) return null; return <section className="rounded-3xl border border-[#e6dce8] bg-white p-6 sm:p-9"><h2 className="font-display text-3xl font-medium">{title}</h2>{tags?<div className="mt-5 flex flex-wrap gap-2">{items.map(item=><span key={item} className="max-w-full break-words rounded-full bg-[#f1e8f3] px-4 py-2 text-sm font-bold text-[#60346e]">{item}</span>)}</div>:<ul className="mt-5 space-y-3">{items.map(item=><li key={item} className="flex min-w-0 gap-3 text-base leading-7 text-[#63536a]"><span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b499f]"/><span className="min-w-0 break-words">{item}</span></li>)}</ul>}</section>; }
