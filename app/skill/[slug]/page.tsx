import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkflowExplorer } from "@/components/workflow-explorer";
import { skillBySlug, skills } from "@/lib/skills";

export function generateStaticParams() { return skills.map(({slug})=>({slug})); }
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> { const {slug}=await params;const skill=skillBySlug(slug);return {title:skill?.name ?? "Skill not found",description:skill?.purpose}; }
export default async function SkillPage({ params }: { params: Promise<{slug:string}> }) { const {slug}=await params;const skill=skillBySlug(slug);if(!skill)notFound();return <WorkflowExplorer skill={skill}/>; }
