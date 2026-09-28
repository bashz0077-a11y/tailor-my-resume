/** UI contract for PR1. IDs and fields map cleanly to a later jobs table. */
export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type ExperienceLevel = "Entry level" | "Mid level" | "Senior" | "Lead";

export type Job = {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  experienceLevel: ExperienceLevel;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  requirements: string[];
  educationRequirements: string[];
  benefits: string[];
  companyDescription: string;
  postedAt: string;
  expiresAt: string | null;
  status: "open" | "closed";
  applicationUrl: string | null;
};
