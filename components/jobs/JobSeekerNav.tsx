"use client";
import Link from "next/link";import {usePathname} from "next/navigation";
const links=[["Dashboard","/dashboard"],["Find jobs","/jobs"],["Applications","/applications"],["Saved","/saved-jobs"]] as const;
export default function JobSeekerNav(){const p=usePathname();return <nav aria-label="Job seeker navigation" className="border-b border-[#eadfeb] bg-white"><div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">{links.map(([label,href])=><Link key={href} href={href} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${p===href?"bg-[#28122f] text-white":"text-[#6b586f] hover:bg-[#f5eef6]"}`}>{label}</Link>)}</div></nav>}
