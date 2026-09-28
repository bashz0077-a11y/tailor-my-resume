import type { Job } from "./types";

export function formatSalary(job: Job): string {
  if (job.salaryMin == null && job.salaryMax == null) return "Salary not listed";
  const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: job.salaryCurrency || "INR", maximumFractionDigits: 0 });
  const min = job.salaryMin == null ? null : formatter.format(job.salaryMin);
  const max = job.salaryMax == null ? null : formatter.format(job.salaryMax);
  const range = min && max ? `${min}–${max}` : min ? `From ${min}` : `Up to ${max}`;
  return job.employmentType === "Internship" ? `${range} / month` : `${range} / year`;
}

export function formatDate(value: string | null): string {
  if (!value) return "Not specified";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

/** Plain description is passed to the existing tailor form; no scoring logic here. */
export function jobToDescription(job: Job): string {
  return [`Job title: ${job.title}`, `Company: ${job.companyName}`, `Location: ${job.location}`, job.description,
    `Responsibilities:\n${job.responsibilities.map(x => `- ${x}`).join("\n")}`,
    `Required skills: ${job.requiredSkills.join(", ")}`,
    `Preferred skills: ${job.preferredSkills.join(", ")}`,
    `Requirements:\n${job.requirements.map(x => `- ${x}`).join("\n")}`].join("\n\n");
}
