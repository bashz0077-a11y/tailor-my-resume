export type TailorResult = {
  jobTitle: string;
  keySkills: string[];
  matchNotes: string[];
  tailoredResume: string;
  coverLetter: string;
  fitScore: number;
  fitLabel: string;
  fitWarning: string | null;
};

  export type WorkExperience = {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
};

export type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  description: string;
};

export type ResumeData = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: WorkExperience[];
  education: EducationEntry[];
  skills: string[];
};
