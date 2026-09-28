import Link from "next/link";
import { FileText } from "lucide-react";

/** Compact shared navigation used by the Jobs surfaces. */
export default function JobsNav() {
  return <header className="border-b border-[#eadfeb] bg-[#fbfaf7]">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 lg:px-10">
      <Link href="/" className="flex min-w-0 items-center gap-2.5 font-extrabold tracking-[-.04em] text-[#24152b]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#52205f] text-[#dfff6b]"><FileText size={18}/></span>TailorMyResume</Link>
      <nav aria-label="Main navigation" className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[#63536a] sm:w-auto">
        <Link className="focus-ring rounded hover:text-[#52205f]" href="/resume-builder">Resume Builder</Link>
        <Link className="focus-ring rounded hover:text-[#52205f]" href="/tailor">Tailor Resume</Link>
        <Link className="focus-ring rounded text-[#52205f] underline decoration-[#c0f052] decoration-2 underline-offset-8" aria-current="page" href="/jobs">Jobs</Link>
      </nav>
    </div>
  </header>;
}
