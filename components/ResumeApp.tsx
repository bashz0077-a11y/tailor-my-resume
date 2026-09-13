"use client";


import { useEffect, useRef, useState } from "react";

import { ArrowRight, Check, Clipboard, Download, FileText, LockKeyhole, Sparkles, UploadCloud, X } from "lucide-react";

import type { TailorResult } from "@/lib/types";


const FREE_LIMIT = 3;


function CountBadge({ remaining }: { remaining: number }) {

  return <div className="rounded-full border border-[#e1d8e5] bg-white/80 px-3 py-1.5 text-sm font-bold text-[#60346e] shadow-sm">{remaining} of {FREE_LIMIT} free uses left</div>;

}


export default function ResumeApp() {

  const [resume, setResume] = useState("");

  const [job, setJob] = useState("");

  const [fileName, setFileName] = useState("");

  const [dragging, setDragging] = useState(false);

  const [used, setUsed] = useState(0);

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState<TailorResult | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setUsed(Number(localStorage.getItem("tmr-uses") || 0));
    const prefill = sessionStorage.getItem("tmr-prefill-resume");
    if (prefill) { setResume(prefill); sessionStorage.removeItem("tmr-prefill-resume"); }
  }, []);


  async function parseFile(file?: File) {

    if (!file) return;

    setError("");

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { setError("Please upload a PDF file, or paste your resume as text."); return; }

    setUploading(true);

    const body = new FormData(); body.append("file", file);

    try {

      const response = await fetch("/api/parse-resume", { method: "POST", body });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setResume(data.text); setFileName(file.name);

    } catch (e) { setError(e instanceof Error ? e.message : "Could not read the PDF."); }

    finally { setUploading(false); }

  }


  async function tailor() {

    setError(""); setResult(null);

    if (!resume.trim() || !job.trim()) { setError("Add your resume and the job description before continuing."); return; }

    if (used >= FREE_LIMIT) { setError("You’ve used all 3 free tailored resumes on this browser."); return; }

    setLoading(true);

    try {

      const response = await fetch("/api/tailor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume, jobDescription: job }) });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setResult(data);

      const next = used + 1; setUsed(next); localStorage.setItem("tmr-uses", String(next));

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }

    finally { setLoading(false); }

  }


  async function copy(text: string) { await navigator.clipboard.writeText(text); }


  async function downloadPdf(title: string, text: string) {

    const { pdf, Document, Page, Text, StyleSheet } = await import("@react-pdf/renderer");

    const styles = StyleSheet.create({ page: { padding: 50, fontFamily: "Helvetica", fontSize: 10.5, lineHeight: 1.55, color: "#25162c" }, title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 18, color: "#6d347f" }, text: { whiteSpace: "pre-wrap" } });

    const doc = <Document><Page size="A4" style={styles.page}><Text style={styles.title}>{title}</Text><Text style={styles.text}>{text}</Text></Page></Document>;

    const blob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`; a.click(); URL.revokeObjectURL(url);

  }


  return <>

    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">

      <a href="#top" className="flex items-center gap-2.5 font-extrabold tracking-[-.04em] text-[#24152b]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#52205f] text-[#dfff6b]"><FileText size={18}/></span>TailorMyResume</a>

      <div className="flex items-center gap-3"><CountBadge remaining={Math.max(0, FREE_LIMIT-used)}/><a href="#workspace" className="focus-ring hidden rounded-full bg-[#24152b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#52205f] sm:block">Start tailoring</a></div>

    </header>


    <main id="top">

      <section className="paper-grid relative overflow-hidden border-y border-[#eadfeb]">

        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full bg-[#dfff6b]/35 blur-3xl"/>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-24">

          <div className="relative">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9cae0] bg-white px-3 py-1.5 text-sm font-bold text-[#6d347f]"><Sparkles size={15}/> Honest tailoring, not fake experience</div>

            <h1 className="max-w-3xl font-display text-5xl font-medium leading-[.98] tracking-[-.045em] text-[#28122f] sm:text-6xl lg:text-7xl">Your experience.<br/><span className="text-[#84419b]">Better positioned.</span></h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#66546b]">Turn one resume into a focused application for every role. We surface the right skills, strengthen your wording, and write the cover letter—without making anything up.</p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#4a3a4f]">{["Facts stay factual", "Private by design", "Ready in moments"].map(x => <span key={x} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#dfff6b]"><Check size={13}/></span>{x}</span>)}</div>

          </div>

          <div className="relative hidden items-center justify-center lg:flex" aria-hidden="true">

            <div className="w-full max-w-md rotate-2 rounded-[2rem] bg-[#28122f] p-5 shadow-soft">

              <div className="rounded-[1.4rem] bg-white p-6">

                <div className="mb-6 flex items-center justify-between"><div className="h-3 w-28 rounded-full bg-[#312038]"/><div className="h-8 w-8 rounded-lg bg-[#dfff6b]"/></div>

                <div className="space-y-2"><div className="h-2 w-full rounded bg-[#eee8ef]"/><div className="h-2 w-11/12 rounded bg-[#eee8ef]"/><div className="h-2 w-3/4 rounded bg-[#eee8ef]"/></div>

                <div className="my-6 h-px bg-[#eee8ef]"/>

                {["Customer strategy", "Project leadership", "Data analysis"].map((x,i)=><div key={x} className="mb-3 flex items-center gap-3 rounded-xl border border-[#eee8ef] p-3"><div className={`h-3 w-3 rounded-full ${i===1?"bg-[#9a62aa]":"bg-[#dfff6b]"}`}/><span className="text-xs font-bold text-[#59455f]">{x}</span></div>)}

              </div>

            </div>

          </div>

        </div>

      </section>


      <section id="workspace" className="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-24">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-extrabold uppercase tracking-[.18em] text-[#8b499f]">Application workspace</p><h2 className="font-display text-4xl font-medium tracking-[-.03em]">Bring the role. We’ll shape the story.</h2></div><div className="flex items-center gap-2 text-sm text-[#736278]"><LockKeyhole size={15}/> Your files aren’t stored</div></div>

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-[#e3d9e6] bg-white p-5 shadow-soft sm:p-7">

            <div className="mb-5 flex items-center justify-between"><div><span className="text-sm font-extrabold text-[#8b499f]">01</span><h3 className="mt-1 text-xl font-extrabold">Your resume</h3></div>{fileName && <button onClick={()=>{setFileName("");setResume("");}} className="focus-ring rounded-full p-2 text-[#8d7d91] hover:bg-[#f5f1f5]" aria-label="Remove file"><X size={18}/></button>}</div>

            <label onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);parseFile(e.dataTransfer.files[0])}} className={`focus-within:ring-2 focus-within:ring-[#9a62aa]/40 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition ${dragging?"border-[#7d3b91] bg-[#f8f1fb]":"border-[#ddcfdf] bg-[#fcfafc] hover:border-[#b58cbe]"}`}>

              <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={e=>parseFile(e.target.files?.[0])}/><span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#f0e7f2] text-[#744087]"><UploadCloud size={21}/></span><span className="font-bold text-[#3c2842]">{uploading?"Reading your PDF…":fileName || "Drop a PDF or browse"}</span><span className="mt-1 text-sm text-[#8a798e]">PDF up to 5 MB</span>

            </label>

            <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#aa9cae]"><span className="h-px flex-1 bg-[#ece4ed]"/>or paste text<span className="h-px flex-1 bg-[#ece4ed]"/></div>

            <textarea value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste your resume here…" className="focus-ring min-h-56 w-full resize-y rounded-2xl border border-[#dfd4e1] bg-white p-4 text-base leading-7 placeholder:text-[#aa9fae]"/>

          </div>

          <div className="rounded-3xl border border-[#e3d9e6] bg-white p-5 shadow-soft sm:p-7">

            <div className="mb-5"><span className="text-sm font-extrabold text-[#8b499f]">02</span><h3 className="mt-1 text-xl font-extrabold">The job description</h3></div>

            <textarea value={job} onChange={e=>setJob(e.target.value)} placeholder="Paste the full job description, including responsibilities and requirements…" className="focus-ring min-h-[382px] w-full resize-y rounded-2xl border border-[#dfd4e1] bg-[#fcfafc] p-4 text-base leading-7 placeholder:text-[#aa9fae]"/>

            <div className="mt-3 flex justify-between text-xs text-[#988a9c]"><span>Full descriptions produce better results</span><span>{job.length.toLocaleString()} characters</span></div>

          </div>

        </div>

        {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e9bdc4] bg-[#fff3f4] p-4 text-sm font-semibold text-[#8f3443]"><X className="mt-0.5 shrink-0" size={17}/>{error}</div>}

        <div className="mt-7 flex flex-col items-center"><button onClick={tailor} disabled={loading || uploading || used>=FREE_LIMIT} className="focus-ring flex min-w-64 items-center justify-center gap-2 rounded-full bg-[#52205f] px-7 py-4 font-extrabold text-white shadow-[0_12px_30px_rgba(82,32,95,.24)] transition hover:-translate-y-0.5 hover:bg-[#6e2d80] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0">{loading?<><span className="loader"/>Finding your strongest match…</>:<>Tailor my application <ArrowRight size={18}/></>}</button><p className="mt-3 text-sm text-[#87798b]">One click uses one free tailoring credit</p></div>

      </section>


      {result && <section ref={resultsRef} className="result-enter border-t border-[#e3d9e6] bg-[#f4eff5] px-5 py-16 lg:px-10 lg:py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8"><p className="mb-2 text-sm font-extrabold uppercase tracking-[.18em] text-[#8b499f]">Your tailored application</p><h2 className="font-display text-4xl font-medium tracking-[-.03em]">Clearer, sharper, still completely you.</h2></div>


          <div className={`mb-6 flex flex-col gap-4 rounded-3xl border p-6 sm:flex-row sm:items-center sm:justify-between ${result.fitScore < 40 ? "border-[#e9bdc4] bg-[#fff3f4]" : result.fitScore < 70 ? "border-[#f0dfa8] bg-[#fffaf0]" : "border-[#c7e6c9] bg-[#f2fbf2]"}`}>

            <div className="flex items-center gap-4">

              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full text-lg font-extrabold text-white ${result.fitScore < 40 ? "bg-[#c0475a]" : result.fitScore < 70 ? "bg-[#c99a2e]" : "bg-[#3f9a4a]"}`}>{result.fitScore}</div>

              <div><p className="font-extrabold text-[#2b1831]">{result.fitLabel}</p><p className="text-sm text-[#5c4d60]">Fit score based on your actual experience vs. this role's requirements</p></div>

            </div>

            {result.fitWarning && <p className="max-w-md text-sm font-semibold leading-6 text-[#8f3443]">{result.fitWarning}</p>}

          </div>


          <div className="mb-6 rounded-3xl bg-[#28122f] p-6 text-white sm:p-8"><div className="flex flex-wrap gap-2">{result.keySkills.map(s=><span key={s} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold">{s}</span>)}</div><div className="mt-6 grid gap-3 md:grid-cols-2">{result.matchNotes.map(n=><p key={n} className="flex gap-2 text-sm leading-6 text-[#ddcedf]"><Check className="mt-1 shrink-0 text-[#dfff6b]" size={15}/>{n}</p>)}</div></div>

          <div className="grid gap-6 lg:grid-cols-2">

            <ResultCard title="Tailored resume" text={result.tailoredResume} onCopy={copy} onDownload={downloadPdf}/>

            <ResultCard title="Cover letter" text={result.coverLetter} onCopy={copy} onDownload={downloadPdf}/>

          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-[#786a7c]">Review every line before sending. TailorMyResume improves presentation, but you’re always the final editor of your application.</p>

        </div>

      </section>}

    </main>

    <footer className="border-t border-[#e7dfe8] px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#7f7183] sm:flex-row"><span className="font-bold text-[#4a354f]">TailorMyResume</span><span>Built for honest, focused applications.</span></div></footer>

  </>;

}


function ResultCard({ title, text, onCopy, onDownload }: { title: string; text: string; onCopy: (s:string)=>void; onDownload:(t:string,s:string)=>void }) {

  const [copied,setCopied]=useState(false);

  return <article className="overflow-hidden rounded-3xl border border-[#dfd4e1] bg-white shadow-soft"><div className="flex items-center justify-between border-b border-[#ece4ed] px-5 py-4 sm:px-7"><h3 className="text-lg font-extrabold">{title}</h3><div className="flex gap-2"><button onClick={()=>{onCopy(text);setCopied(true);setTimeout(()=>setCopied(false),1600)}} className="focus-ring flex items-center gap-1.5 rounded-full border border-[#dfd4e1] px-3 py-2 text-sm font-bold transition hover:bg-[#f6f1f7]"><Clipboard size={15}/>{copied?"Copied":"Copy"}</button><button onClick={()=>onDownload(title,text)} className="focus-ring flex items-center gap-1.5 rounded-full bg-[#dfff6b] px-3 py-2 text-sm font-extrabold text-[#2b1831] transition hover:bg-[#d4f45e]"><Download size={15}/>PDF</button></div></div><pre className="max-h-[650px] overflow-auto whitespace-pre-wrap p-5 font-sans text-[15px] leading-7 text-[#4d3c52] sm:p-7">{text}</pre></article>;

}


