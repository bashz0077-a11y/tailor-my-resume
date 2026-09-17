export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel: string;
  salary?: string;
  posted: string;
  summary: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
};

// Demo data only. Employer-posted jobs will replace/extend this source in a later PR.
export const jobs: Job[] = [
  { id:"frontend-developer", title:"Frontend Developer", company:"DemoTech Labs", location:"Chennai, Tamil Nadu", workplaceType:"Hybrid", employmentType:"Full-time", experienceLevel:"1–3 years", salary:"₹4–8 LPA", posted:"Today", summary:"Build accessible, responsive product experiences with React and TypeScript.", description:"Work with product and design to build responsive web experiences, maintain reusable components, review code, and improve performance and accessibility.", requiredSkills:["React","TypeScript","HTML","CSS","Git"], preferredSkills:["Next.js","Tailwind CSS","Testing"] },
  { id:"full-stack-developer", title:"Full-Stack Developer", company:"SampleWorks", location:"Bengaluru, Karnataka", workplaceType:"Remote", employmentType:"Full-time", experienceLevel:"2–4 years", salary:"₹7–12 LPA", posted:"1 day ago", summary:"Ship modern web applications across frontend, APIs and data.", description:"Build product features end-to-end using modern JavaScript, APIs and relational data. Collaborate on architecture, testing, deployment and reliability.", requiredSkills:["React","Node.js","TypeScript","SQL","Git"], preferredSkills:["Next.js","PostgreSQL","Vercel"] },
  { id:"junior-web-developer", title:"Junior Web Developer", company:"Example Digital", location:"Chennai, Tamil Nadu", workplaceType:"On-site", employmentType:"Full-time", experienceLevel:"0–2 years", salary:"₹3–5 LPA", posted:"2 days ago", summary:"Grow your web development skills while delivering customer-facing sites.", description:"Support development and maintenance of responsive websites, fix bugs, implement designs and learn modern engineering practices with the team.", requiredSkills:["JavaScript","HTML","CSS","Git"], preferredSkills:["React","TypeScript"] }
];

export function getJob(id: string) { return jobs.find(job => job.id === id); }
