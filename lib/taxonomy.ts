export const TAXONOMY_VERSION = 1;

export const categories = [
  { id: "agent-skill-tools", label: "Agent & Skill Tools", color: "#9b8cff" },
  { id: "communication-collaboration", label: "Communication & Collaboration", color: "#52c7b8" },
  { id: "design-ux", label: "Design & UX", color: "#ff8eb5" },
  { id: "development", label: "Development", color: "#64a8ff" },
  { id: "documents-data", label: "Documents & Data", color: "#e6b85c" },
  { id: "infrastructure", label: "Infrastructure", color: "#8d9aaa" },
  { id: "media-creation", label: "Media Creation", color: "#ff906e" },
  { id: "planning-reasoning", label: "Planning & Reasoning", color: "#7fd36b" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type FunctionalTag = "create" | "review" | "plan" | "research" | "diagnose" | "automate" | "teach" | "deploy";
export type ClassificationProvenance = "declared" | "rule-derived" | "llm-assessed" | "reviewed";

export type Classification = {
  taxonomyVersion: typeof TAXONOMY_VERSION;
  provenance: ClassificationProvenance;
  confidence: number;
  reason: string;
};

export const categoryById = Object.fromEntries(categories.map((category) => [category.id, category])) as Record<CategoryId, (typeof categories)[number]>;

