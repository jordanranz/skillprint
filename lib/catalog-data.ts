import snapshot from "@/data/skills/top100.json";
import auditSnapshot from "@/data/skills/power-audits.json";
import { genericNodes, skills, type Skill } from "./skills";
import { categoryById, TAXONOMY_VERSION, type CategoryId, type Classification, type FunctionalTag } from "./taxonomy";

type SnapshotSkill = (typeof snapshot.skills)[number];
type AuditReport = {
  id: string;
  hash: string;
  power: number;
  purpose: string;
  bestFor: string;
  footprint: string;
  qualities: Skill["qualities"];
  nodes: Skill["nodes"];
  edges: Skill["edges"];
};

export type CatalogEntry = {
  id: string;
  rank: number;
  slug: string;
  name: string;
  owner: string;
  purpose: string;
  installs: number;
  rankDelta: number | null;
  power: number | null;
  updatedDays: number | null;
  scout: "Static inspection" | "Behavioral evaluation" | "Not inspected";
  category: CategoryId;
  tags: FunctionalTag[];
  sourceTopics: string[];
  color: string;
  detailSlug: string;
  url: string;
  classification: Classification;
};

const aliases: Record<string,string> = {
  "vercel-react-best-practices": "react-best-practices",
};
const auditById = new Map((auditSnapshot.audits as unknown as AuditReport[]).map((audit) => [audit.id, audit]));

const titleize = (slug:string) => slug.split("-").map(word => /^(ai|api|ui|ux|pdf|tdd|mcp|okr|vc|im|gpt)$/i.test(word) ? word.toUpperCase() : word.charAt(0).toUpperCase()+word.slice(1)).join(" ");

function classify(entry: SnapshotSkill): { category: CategoryId; tags: FunctionalTag[]; reason: string } {
  const value = `${entry.slug} ${entry.source}`.toLowerCase();
  if (/find-skills|skill-creator|setup-.*skills|agent-browser|agent-skill|mcp/.test(value)) return { category:"agent-skill-tools", tags:["research","automate"], reason:"Finds, installs, creates, or operates agent capabilities." };
  if (/lark-(im|mail|calendar|event|vc|contact|attendance|approval|okr|task)|meeting-summary|standup-report/.test(value)) return { category:"communication-collaboration", tags:["automate"], reason:"Coordinates communication or work between people." };
  if (/lark-(doc|base|drive|sheets|wiki|minutes|slides|whiteboard)|pdf|spreadsheet|document|xlsx|docx/.test(value)) return { category:"documents-data", tags:["create","automate"], reason:"Creates or operates on documents and structured records." };
  if (/image|video|audio|flux|wan-|seedance|comfy|happyhorse|media/.test(value)) return { category:"media-creation", tags:["create"], reason:"Produces or transforms visual, video, or audio media." };
  if (/frontend-design|web-design|design-system|ui-|ux-|accessibility/.test(value)) return { category:"design-ux", tags:["create","review"], reason:"Creates or evaluates interfaces and user experiences." };
  if (/azure|cloud|deploy|database|security|docker|kubernetes|terraform|devops|infrastructure/.test(value)) return { category:"infrastructure", tags:["deploy","diagnose"], reason:"Operates systems, services, environments, or security controls." };
  if (/grill|wayfinder|brainstorm|research|plan|handoff|decision/.test(value)) return { category:"planning-reasoning", tags:["plan","review"], reason:"Produces plans, decisions, research, or clarified reasoning." };
  return { category:"development", tags:["create","review"], reason:"Primarily supports software implementation or code quality." };
}

function fallbackPurpose(entry: SnapshotSkill, category: CategoryId) {
  if (entry.slug === "find-skills") return "Discover and install agent skills for a task.";
  if (entry.slug === "grill-with-docs") return "Stress-test documentation through a focused interview.";
  if (entry.slug === "improve-codebase-architecture") return "Review and improve a codebase's architectural boundaries.";
  if (entry.slug === "tdd") return "Guide implementation through test-driven development.";
  if (entry.slug === "agent-browser") return "Automate browser interactions for agent workflows.";
  if (entry.slug === "handoff") return "Package working context for a reliable agent handoff.";
  return `${categoryById[category].label} workflow from ${entry.source}.`;
}

function reviewedSkill(entry: SnapshotSkill): Skill | undefined {
  const detailSlug = aliases[entry.slug] ?? entry.slug;
  return skills.find(skill => skill.slug === detailSlug);
}

const blueprintSlug = (entry: SnapshotSkill, reviewed?: Skill) => reviewed?.slug ?? entry.id.replaceAll("/", "--");

export const catalogGeneratedAt = snapshot.generatedAt;
export const catalogEntries: CatalogEntry[] = snapshot.skills.map((entry) => {
  const reviewed = reviewedSkill(entry);
  const audit = auditById.get(entry.id);
  const currentAudit = audit?.hash === entry.hash ? audit : undefined;
  const derived = classify(entry);
  const category = reviewed?.category ?? derived.category;
  return {
    id: entry.id,
    rank: entry.rank,
    slug: entry.slug,
    name: reviewed?.name ?? titleize(entry.name),
    owner: entry.source.split("/")[0],
    purpose: currentAudit?.purpose ?? reviewed?.purpose ?? fallbackPurpose(entry,category),
    installs: entry.installs,
    rankDelta: null,
    power: currentAudit?.power ?? null,
    updatedDays: reviewed?.updatedDays ?? null,
    scout: currentAudit ? "Static inspection" : "Not inspected",
    category,
    tags: reviewed?.tags ?? derived.tags,
    sourceTopics: reviewed?.sourceTopics ?? [],
    color: categoryById[category].color,
    detailSlug: blueprintSlug(entry,reviewed),
    url: entry.url,
    classification: reviewed?.classification ?? {
      taxonomyVersion: TAXONOMY_VERSION,
      provenance: "rule-derived",
      confidence: .72,
      reason: derived.reason,
    },
  };
});

export function blueprintBySlug(slug: string): Skill | undefined {
  const entry = catalogEntries.find(skill => skill.detailSlug === slug);
  if (!entry) return skills.find(skill => skill.slug === slug);
  const report = auditById.get(entry.id);
  const currentReport = report?.hash === snapshot.skills.find(skill => skill.id === entry.id)?.hash ? report : undefined;
  if (currentReport) return {
    slug: entry.detailSlug,
    name: entry.name,
    owner: entry.owner,
    purpose: currentReport.purpose,
    bestFor: currentReport.bestFor,
    power: currentReport.power,
    installs: entry.installs,
    trend: 0,
    updatedDays: 0,
    category: entry.category,
    tags: entry.tags,
    sourceTopics: entry.sourceTopics,
    classification: entry.classification,
    color: entry.color,
    scout: "Static inspection",
    sourceUrl: entry.url,
    footprint: currentReport.footprint,
    qualities: currentReport.qualities,
    nodes: currentReport.nodes,
    edges: currentReport.edges,
  };
  return {
    slug: entry.detailSlug,
    name: entry.name,
    owner: entry.owner,
    purpose: entry.purpose,
    bestFor: `Understanding how this ${categoryById[entry.category].label.toLowerCase()} skill is likely to move from a request to a verified result.`,
    power: 0,
    installs: entry.installs,
    trend: 0,
    updatedDays: 0,
    category: entry.category,
    tags: entry.tags,
    sourceTopics: entry.sourceTopics,
    classification: entry.classification,
    color: entry.color,
    scout: "Not inspected",
    sourceUrl: entry.url,
    footprint: "Not measured",
    qualities: [],
    nodes: genericNodes,
    edges: [["trigger","inspect"],["inspect","execute"],["execute","verify"]],
  };
}
