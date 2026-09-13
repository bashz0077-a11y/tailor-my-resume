import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] flex items-center justify-center px-5">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2.5 font-extrabold tracking-[-.04em] text-[#24152b]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#52205f] text-[#dfff6b]"><FileText size={20}/></span>
          <span className="text-xl">TailorMyResume</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-[-.03em] text-[#28122f] mb-4">
          Build it. Tailor it. Apply with confidence.
        </h1>
        <p className="text-lg text-[#66546b] mb-10">
          Create a resume from scratch, or tailor one you already have — without making anything up.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/resume-builder" className="flex items-center justify-center gap-2 rounded-full bg-[#52205f] px-7 py-4 font-extrabold text-white shadow-[0_12px_30px_rgba(82,32,95,.24)] transition hover:-translate-y-0.5 hover:bg-[#6e2d80]">
            Build My Resume <ArrowRight size={18}/>
          </Link>
          <Link href="/tailor" className="flex items-center justify-center gap-2 rounded-full border-2 border-[#52205f] px-7 py-4 font-extrabold text-[#52205f] transition hover:bg-[#f6f1f7]">
            Tailor Existing Resume
          </Link>
        </div>
      </div>
    </main>
  );
}
