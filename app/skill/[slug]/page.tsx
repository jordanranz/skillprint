import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkflowExplorer } from "@/components/workflow-explorer";
import { blueprintBySlug, catalogEntries } from "@/lib/catalog-data";
import { skills } from "@/lib/skills";

export function generateStaticParams() { return [...new Set([...skills.map(skill=>skill.slug),...catalogEntries.map(skill=>skill.detailSlug)])].map(slug=>({slug})); }
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> { const {slug}=await params;const skill=blueprintBySlug(slug);return {title:skill?.name ?? "Skill not found",description:skill?.purpose}; }
export default async function SkillPage({ params }: { params: Promise<{slug:string}> }) { const {slug}=await params;const skill=blueprintBySlug(slug);if(!skill)notFound();return <WorkflowExplorer skill={skill}/>; }
