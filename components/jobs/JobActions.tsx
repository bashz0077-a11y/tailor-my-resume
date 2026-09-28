"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Job } from "@/lib/jobs/types";
import { jobToDescription } from "@/lib/jobs/format";

export default function JobActions({ job, compact = false }: { job: Job; compact?: boolean }) {
  const router = useRouter();
  function openTailor(intent: "match" | "tailor") {
    // One-time handoff to the existing Tailor Resume form. No separate scoring engine.
    sessionStorage.setItem("tmr-prefill-job", jobToDescription(job));
    sessionStorage.setItem("tmr-job-intent", intent);
    router.push("/tailor");
  }
  if (compact) return <button type="button" onClick={() => openTailor("match")} className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#d9c7de] px-4 text-sm font-extrabold text-[#52205f] transition hover:bg-[#f8f1fa]"><Sparkles size={15}/> Check Match</button>;
  return <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
    <button type="button" onClick={() => openTailor("match")} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#52205f] px-6 font-extrabold text-white hover:bg-[#6e2d80]"><Sparkles size={17}/> Check My Match</button>
    <button type="button" onClick={() => openTailor("tailor")} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[#52205f] px-6 font-extrabold text-[#52205f] hover:bg-[#f8f1fa]">Tailor Resume for This Job <ArrowRight size={17}/></button>
    {job.applicationUrl ? <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[#dfff6b] px-6 font-extrabold text-[#28122f] hover:bg-[#d1f25a]">Apply Now</a> : <button type="button" disabled title="Applications are unavailable for demo jobs" className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-[#e7e1e9] px-6 font-extrabold text-[#786c7c]">Apply Now</button>}
  </div>;
}
