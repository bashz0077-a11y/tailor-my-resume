import type { Job } from "./types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

type JobRow = {
  id: string; title: string; company_name: string; company_logo: string | null; location: string;
  workplace_type: Job["workplaceType"]; employment_type: Job["employmentType"];
  salary_min: number | null; salary_max: number | null; salary_currency: string | null;
  experience_level: Job["experienceLevel"]; description: string; responsibilities: string[] | null;
  required_skills: string[] | null; preferred_skills: string[] | null; requirements: string[] | null;
  education_requirements: string[] | null; benefits: string[] | null; company_description: string | null;
  application_url: string | null; status: "open" | "closed"; published_at: string | null;
  created_at: string; expires_at: string | null;
};

function mapJob(row: JobRow): Job {
  return {
    id: row.id, title: row.title, companyName: row.company_name, companyLogo: row.company_logo,
    location: row.location, workplaceType: row.workplace_type, employmentType: row.employment_type,
    salaryMin: row.salary_min, salaryMax: row.salary_max, salaryCurrency: row.salary_currency,
    experienceLevel: row.experience_level, description: row.description,
    responsibilities: row.responsibilities ?? [], requiredSkills: row.required_skills ?? [],
    preferredSkills: row.preferred_skills ?? [], requirements: row.requirements ?? [],
    educationRequirements: row.education_requirements ?? [], benefits: row.benefits ?? [],
    companyDescription: row.company_description ?? "", postedAt: row.published_at ?? row.created_at,
    expiresAt: row.expires_at, status: row.status, applicationUrl: row.application_url,
  };
}

export async function getOpenJobs(): Promise<Job[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("jobs").select("*").eq("status", "open").order("published_at", { ascending: false });
  if (error) { console.error("Unable to load jobs", error.message); return []; }
  return (data as JobRow[]).map(mapJob);
}

export async function getOpenJob(id: string): Promise<Job | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).eq("status", "open").maybeSingle();
  if (error || !data) return null;
  return mapJob(data as JobRow);
}
