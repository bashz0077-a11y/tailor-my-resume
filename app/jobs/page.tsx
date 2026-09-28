import type { Metadata } from "next";
import JobsNav from "@/components/jobs/JobsNav";
import JobsExplorer from "@/components/jobs/JobsExplorer";
import { demoJobs } from "@/lib/jobs/demo-jobs";

export const metadata: Metadata = { title: "Explore Jobs | TailorMyResume", description: "Discover roles and prepare a focused application." };

export default function JobsPage() {
  return <><JobsNav/><main className="min-h-screen overflow-x-hidden bg-[#fbfaf7]">
    <section className="paper-grid border-b border-[#eadfeb] bg-[#f7f1f8]"><div className="mx-auto max-w-7xl px-5 pb-20 pt-14 lg:px-10 lg:pt-20"><span className="inline-flex rounded-full border border-[#dfd0e3] bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#744087]">Your next move starts here</span><h1 className="mt-5 max-w-3xl font-display text-5xl font-medium leading-[1.03] tracking-[-.04em] text-[#28122f] sm:text-6xl">Find a role that <span className="text-[#84419b]">fits your story.</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#6b586f] sm:text-lg">Explore roles, see what each team needs, and bring your real experience into focus. Every listing below is demo content for this first release.</p></div></section>
    <JobsExplorer jobs={demoJobs}/>
  </main></>;
}
