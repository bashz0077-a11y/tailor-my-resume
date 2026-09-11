import type { TailorResult } from "./types";

const STOP = new Set(["and","the","with","for","that","this","from","your","you","our","are","will","have","has","into","about","years","work","role","team","job","who","but","not","all","can"]);

export function localTailor(resume: string, job: string): TailorResult {
  const frequencies = new Map<string, number>();
  const phrases = job.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || [];
  for (const word of phrases) if (!STOP.has(word)) frequencies.set(word, (frequencies.get(word) || 0) + 1);
  const skills = [...frequencies.entries()].sort((a,b) => b[1]-a[1]).slice(0, 10).map(([w]) => w.replace(/^./, c => c.toUpperCase()));
  const lines = resume.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const scored = lines.map((line, index) => ({ line, index, score: skills.filter(s => line.toLowerCase().includes(s.toLowerCase())).length }));
  scored.sort((a,b) => b.score-a.score || a.index-b.index);
  const summarySource = lines.find(l => l.length > 70 && !/^[•\-]/.test(l)) || lines.slice(0,2).join(" ");
  const bullets = scored.filter(x => /^[•\-]/.test(x.line) || x.line.length > 35).slice(0, 12).map(x => {
    const clean = x.line.replace(/^[•\-]\s*/, "").replace(/\.$/, "");
    return `• ${clean.charAt(0).toUpperCase()}${clean.slice(1)}.`;
  });
  const jobTitle = job.match(/(?:job title|position|role)\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim() || "this role";
  return {
    jobTitle,
    keySkills: skills,
    matchNotes: skills.slice(0,4).map(s => resume.toLowerCase().includes(s.toLowerCase()) ? `${s} is already supported by your resume.` : `${s} appears important; add it only if your real experience supports it.`),
    tailoredResume: `PROFESSIONAL SUMMARY\n${summarySource}\n\nSELECTED EXPERIENCE\n${bullets.join("\n") || lines.join("\n")}`,
    coverLetter: `Dear Hiring Manager,\n\nI am writing to express my interest in ${jobTitle}. My background, as outlined in my resume, includes experience relevant to ${skills.slice(0,4).join(", ")}. I would welcome the opportunity to bring these strengths to your team.\n\nThroughout my experience, I have focused on delivering dependable work, collaborating effectively, and building practical skills that align with the needs described in this position. I am particularly drawn to the opportunity to contribute while continuing to grow in the role.\n\nThank you for considering my application. I would be pleased to discuss how my experience could support your team’s goals.\n\nSincerely,\n[Your name]`
  };
}
