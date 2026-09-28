import type { Job } from "./types";

/** DEMO DATA ONLY. Replace this module's exports with a data access layer in PR2. */
export const demoJobs: Job[] = [
  {
    id: "demo-product-designer", title: "Senior Product Designer", companyName: "Northstar Studio", companyLogo: null,
    location: "Bengaluru, India", workplaceType: "Hybrid", employmentType: "Full-time", salaryMin: 2400000, salaryMax: 3600000, salaryCurrency: "INR", experienceLevel: "Senior",
    description: "Shape thoughtful digital experiences across a growing suite of tools for modern teams. Work closely with product and engineering from discovery through delivery.",
    responsibilities: ["Lead end-to-end design for key product journeys.", "Turn research insights into clear prototypes and production-ready specifications.", "Partner with engineers to refine details during implementation."],
    requiredSkills: ["Figma", "Product design", "User research", "Prototyping"], preferredSkills: ["Design systems", "Accessibility"],
    requirements: ["Experience owning product design work from discovery to launch.", "A portfolio that explains your decisions and outcomes."], educationRequirements: ["No specific degree required; equivalent practical experience is welcome."],
    benefits: ["Flexible hybrid schedule", "Learning budget", "Health coverage"], companyDescription: "Northstar Studio is a fictional design-led software company created for this demo.", postedAt: "2026-09-20", expiresAt: "2026-10-20", status: "open", applicationUrl: null
  },
  {
    id: "demo-frontend-engineer", title: "Frontend Engineer", companyName: "Canopy Labs", companyLogo: null,
    location: "Remote · India", workplaceType: "Remote", employmentType: "Full-time", salaryMin: 1800000, salaryMax: 2800000, salaryCurrency: "INR", experienceLevel: "Mid level",
    description: "Build fast, accessible interfaces for teams working across the globe. Take ideas from rough concepts to reliable production experiences.",
    responsibilities: ["Build responsive interfaces with React and TypeScript.", "Collaborate with designers on accessible interaction patterns.", "Improve performance and maintainability across the frontend."],
    requiredSkills: ["React", "TypeScript", "CSS", "Accessibility"], preferredSkills: ["Next.js", "Testing"],
    requirements: ["Experience shipping production web applications.", "Comfortable reviewing code and communicating trade-offs."], educationRequirements: ["Degree in a relevant field or equivalent hands-on experience."],
    benefits: ["Remote-first working", "Home-office allowance", "Wellness days"], companyDescription: "Canopy Labs is a fictional software team created for this demo.", postedAt: "2026-09-18", expiresAt: "2026-10-18", status: "open", applicationUrl: null
  },
  {
    id: "demo-growth-analyst", title: "Growth Analyst", companyName: "Morrow Commerce", companyLogo: null,
    location: "Chennai, India", workplaceType: "On-site", employmentType: "Contract", salaryMin: null, salaryMax: null, salaryCurrency: null, experienceLevel: "Entry level",
    description: "Help a commerce team understand its customers and turn campaign data into practical next steps.",
    responsibilities: ["Create clear reports from campaign and customer data.", "Support experiments with measurable goals.", "Share actionable insights with marketing partners."],
    requiredSkills: ["Analytics", "SQL", "Reporting", "Spreadsheets"], preferredSkills: ["Looker", "A/B testing"],
    requirements: ["Strong analytical and communication skills.", "Ability to explain findings to non-technical partners."], educationRequirements: ["Bachelor’s degree or equivalent experience preferred."],
    benefits: ["Mentorship", "Flexible leave"], companyDescription: "Morrow Commerce is a fictional commerce company created for this demo.", postedAt: "2026-09-16", expiresAt: null, status: "open", applicationUrl: null
  },
  {
    id: "demo-content-intern", title: "Content Marketing Intern", companyName: "Fieldnotes", companyLogo: null,
    location: "Mumbai, India", workplaceType: "Hybrid", employmentType: "Internship", salaryMin: 25000, salaryMax: 35000, salaryCurrency: "INR", experienceLevel: "Entry level",
    description: "Learn how an editorial team plans, produces, and measures useful content for an engaged audience.",
    responsibilities: ["Research topics and draft articles.", "Help maintain the content calendar.", "Review basic performance metrics and suggest improvements."],
    requiredSkills: ["Writing", "Research", "Editing"], preferredSkills: ["SEO", "Content strategy"],
    requirements: ["Clear written communication.", "A willingness to learn and incorporate feedback."], educationRequirements: ["Open to students and recent graduates; no specific degree required."],
    benefits: ["Mentorship", "Flexible hybrid schedule"], companyDescription: "Fieldnotes is a fictional editorial company created for this demo.", postedAt: "2026-09-12", expiresAt: "2026-10-12", status: "open", applicationUrl: null
  },
  {
    id: "demo-support-specialist", title: "Customer Support Specialist", companyName: "Kindred Cloud", companyLogo: null,
    location: "Remote · India", workplaceType: "Remote", employmentType: "Part-time", salaryMin: null, salaryMax: null, salaryCurrency: null, experienceLevel: "Mid level",
    description: "Help customers solve product questions with empathy, precision, and a love of clear communication.",
    responsibilities: ["Resolve customer enquiries across email and chat.", "Document recurring issues for the product team.", "Improve help-centre articles."],
    requiredSkills: ["Customer support", "Communication", "Troubleshooting"], preferredSkills: ["Documentation", "SaaS"],
    requirements: ["Experience in customer-facing support.", "Ability to handle complex questions independently."], educationRequirements: ["No specific degree required."],
    benefits: ["Flexible hours", "Remote equipment allowance"], companyDescription: "Kindred Cloud is a fictional SaaS company created for this demo.", postedAt: "2026-09-10", expiresAt: null, status: "open", applicationUrl: null
  }
];

export function getDemoJob(id: string) { return demoJobs.find(job => job.id === id && job.status === "open"); }
