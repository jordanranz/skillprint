import { categoryById, TAXONOMY_VERSION, type CategoryId, type Classification, type FunctionalTag } from "./taxonomy";

export type SkillNode = {
  id: string;
  kind: "human" | "agent" | "artifact" | "loop";
  label: string;
  note: string;
  summary: string;
  actor: string;
  output: string;
  source: string;
};

export type Skill = {
  slug: string;
  name: string;
  owner: string;
  purpose: string;
  bestFor: string;
  power: number;
  installs: number;
  trend: number;
  updatedDays: number;
  ecosystem?: {
    url: string;
    stars: number;
    forks: number;
    openIssues: number;
    pushedAt: string;
    updatedAt: string;
    commits30d: number;
    commits30dCapped: boolean;
  };
  category: CategoryId;
  tags: FunctionalTag[];
  sourceTopics: string[];
  classification: Classification;
  color: string;
  scout: "Static inspection" | "Behavioral evaluation" | "Not inspected";
  sourceUrl?: string;
  footprint: string;
  qualities: { label: string; score: number; word: string }[];
  nodes: SkillNode[];
  edges: [string, string][];
};

type SkillInput = Omit<Skill, "color" | "classification"> & { classification?: Partial<Classification> };
const defineSkill = (skill: SkillInput): Skill => ({
  ...skill,
  color: categoryById[skill.category].color,
  classification: {
    taxonomyVersion: TAXONOMY_VERSION,
    provenance: skill.classification?.provenance ?? "reviewed",
    confidence: skill.classification?.confidence ?? 1,
    reason: skill.classification?.reason ?? `Principal outcome matches ${categoryById[skill.category].label}.`,
  },
});

const wayfinderNodes: SkillNode[] = [
  { id: "destination", kind: "human", label: "Name destination", note: "Define done.", summary: "Agree on the concrete end state before creating tickets.", actor: "Human + agent", output: "Destination", source: "Naming the destination is the first act of charting." },
  { id: "frontier", kind: "agent", label: "Map frontier", note: "Surface decisions.", summary: "Turn uncertainty into explicit decisions that can be resolved.", actor: "Agent", output: "Decision frontier", source: "Map the frontier breadth-first before diving into one branch." },
  { id: "unknowns", kind: "agent", label: "Resolve unknowns", note: "Research facts.", summary: "Run bounded research tickets for questions with factual answers.", actor: "Agent", output: "Research findings", source: "Research tickets may run independently when their inputs are known." },
  { id: "map", kind: "artifact", label: "Create map", note: "Structure route.", summary: "Record decisions, dependencies, blockers, and remaining fog.", actor: "Agent", output: "Decision map", source: "The map is durable state shared across sessions and agents." },
  { id: "decision", kind: "human", label: "Choose decision", note: "Resolve deeply.", summary: "Pause where judgment or product intent must come from a person.", actor: "Human", output: "Resolved ticket", source: "Only one actionable frontier ticket should be resolved at a time." },
  { id: "advance", kind: "loop", label: "Advance frontier", note: "Reveal next.", summary: "Promote newly visible work and repeat until the destination is reached.", actor: "Human + agent", output: "New frontier", source: "Each resolved decision reveals the next useful slice of work." },
];

const grillNodes: SkillNode[] = [
  { id: "claim", kind: "human", label: "State the idea", note: "Make it concrete.", summary: "Put the plan or decision into a form that can be challenged.", actor: "Human", output: "Initial claim", source: "Begin with the plan, decision, or idea the user wants to test." },
  { id: "probe", kind: "agent", label: "Probe assumptions", note: "Ask one question.", summary: "Target the assumption most likely to change the plan.", actor: "Agent", output: "Focused question", source: "Ask questions one at a time and follow the answer." },
  { id: "pressure", kind: "agent", label: "Apply pressure", note: "Expose tradeoffs.", summary: "Use the answer to uncover contradictions, costs, and missing evidence.", actor: "Agent", output: "Sharper constraint", source: "Do not accept vague language when a concrete answer is possible." },
  { id: "record", kind: "artifact", label: "Record decisions", note: "Keep the receipts.", summary: "Separate settled decisions from unresolved assumptions.", actor: "Agent", output: "Decision record", source: "Summarize what changed, what held, and what remains uncertain." },
  { id: "loop", kind: "loop", label: "Continue grilling", note: "Stop when durable.", summary: "Repeat until the plan survives pressure or is revised.", actor: "Human + agent", output: "Tested plan", source: "Continue relentlessly until the important uncertainty is resolved." },
];

export const genericNodes: SkillNode[] = [
  { id: "trigger", kind: "human", label: "Match request", note: "Detect intent.", summary: "Identify when the skill is the right tool for the request.", actor: "Human + agent", output: "Matched trigger", source: "The skill description governs when this workflow should load." },
  { id: "inspect", kind: "agent", label: "Inspect context", note: "Gather inputs.", summary: "Read only the sources required for the current task.", actor: "Agent", output: "Working context", source: "Load references progressively and keep the context focused." },
  { id: "execute", kind: "agent", label: "Run workflow", note: "Apply guidance.", summary: "Follow the skill's procedure with the appropriate degree of freedom.", actor: "Agent", output: "Task result", source: "Use bundled scripts when consistency and determinism matter." },
  { id: "verify", kind: "artifact", label: "Verify result", note: "Check evidence.", summary: "Validate the artifact or outcome before handing it back.", actor: "Agent", output: "Verified result", source: "Verification should be proportional to the risk of the task." },
];

export const skills: Skill[] = [
  defineSkill({ slug: "react-best-practices", name: "React Best Practices", owner: "vercel-labs", purpose: "Apply production-grade React and Next.js performance patterns.", bestFor: "React reviews, refactors, and performance-sensitive implementations.", power: 9420, installs: 640300, trend: 23, updatedDays: 5, category: "development", tags: ["review","diagnose"], sourceTopics: ["React","Next.js","Testing"], scout: "Static inspection", footprint: "~4,820 invoked tokens", qualities: [{label:"Guidance",score:9,word:"Excellent"},{label:"Efficiency",score:8,word:"Strong"},{label:"Coverage",score:10,word:"Excellent"}], nodes: genericNodes, edges: [["trigger","inspect"],["inspect","execute"],["execute","verify"]] }),
  defineSkill({ slug: "frontend-design", name: "Frontend Design", owner: "anthropics", purpose: "Create distinctive interfaces with an intentional visual point of view.", bestFor: "New product surfaces, redesigns, and visual-system decisions.", power: 9010, installs: 531200, trend: 31, updatedDays: 3, category: "design-ux", tags: ["create","review"], sourceTopics: ["Design","UI"], scout: "Static inspection", footprint: "~2,940 invoked tokens", qualities: [{label:"Guidance",score:9,word:"Excellent"},{label:"Efficiency",score:7,word:"Good"},{label:"Coverage",score:8,word:"Strong"}], nodes: genericNodes, edges: [["trigger","inspect"],["inspect","execute"],["execute","verify"]] }),
  defineSkill({ slug: "skill-creator", name: "Skill Creator", owner: "openai", purpose: "Create, validate, and refine reusable agent skills.", bestFor: "Skill authoring, trigger design, packaging, and evaluation.", power: 8760, installs: 458700, trend: 15, updatedDays: 7, category: "agent-skill-tools", tags: ["create","review","teach"], sourceTopics: ["Agent workflows"], scout: "Static inspection", footprint: "~3,180 invoked tokens", qualities: [{label:"Guidance",score:9,word:"Excellent"},{label:"Efficiency",score:8,word:"Strong"},{label:"Coverage",score:9,word:"Excellent"}], nodes: genericNodes, edges: [["trigger","inspect"],["inspect","execute"],["execute","verify"]] }),
  defineSkill({ slug: "grill-me", name: "Grill Me", owner: "mattpocock", purpose: "Stress-test a plan through a focused, relentless interview.", bestFor: "Architecture decisions, product ideas, and hidden assumptions.", power: 8270, installs: 886400, trend: 18, updatedDays: 2, category: "planning-reasoning", tags: ["plan","review","diagnose"], sourceTopics: ["Agent workflows"], scout: "Static inspection", footprint: "~356 invoked tokens", qualities: [{label:"Guidance",score:8,word:"Strong"},{label:"Efficiency",score:9,word:"Excellent"},{label:"Coverage",score:7,word:"Good"}], nodes: grillNodes, edges: [["claim","probe"],["probe","pressure"],["pressure","record"],["record","loop"],["loop","probe"]] }),
  defineSkill({ slug: "wayfinder", name: "Wayfinder", owner: "mattpocock", purpose: "Map ambiguous work into a durable frontier of decisions.", bestFor: "Large projects, multi-session planning, and collaborative decisions.", power: 8040, installs: 412900, trend: 11, updatedDays: 1, category: "planning-reasoning", tags: ["plan","research"], sourceTopics: ["Agent workflows"], scout: "Static inspection", footprint: "~2,656 invoked tokens", qualities: [{label:"Guidance",score:8,word:"Strong"},{label:"Efficiency",score:7,word:"Good"},{label:"Coverage",score:8,word:"Strong"}], nodes: wayfinderNodes, edges: [["destination","frontier"],["frontier","unknowns"],["frontier","map"],["unknowns","map"],["map","decision"],["decision","advance"],["advance","frontier"]] }),
  defineSkill({ slug: "web-design-guidelines", name: "Web Design Guidelines", owner: "vercel-labs", purpose: "Audit interfaces against durable web conventions.", bestFor: "UI reviews, accessibility passes, and implementation audits.", power: 7910, installs: 712600, trend: 9, updatedDays: 9, category: "design-ux", tags: ["review","diagnose"], sourceTopics: ["Design","UI","Accessibility"], scout: "Static inspection", footprint: "~3,240 invoked tokens", qualities: [{label:"Guidance",score:8,word:"Strong"},{label:"Efficiency",score:7,word:"Good"},{label:"Coverage",score:8,word:"Strong"}], nodes: genericNodes, edges: [["trigger","inspect"],["inspect","execute"],["execute","verify"]] }),
  defineSkill({ slug: "pdf", name: "PDF", owner: "openai", purpose: "Read, create, inspect, and verify PDF documents.", bestFor: "Form work, extraction, generation, and visual QA.", power: 7680, installs: 681200, trend: -2, updatedDays: 12, category: "documents-data", tags: ["create","review","automate"], sourceTopics: ["Documents"], scout: "Static inspection", footprint: "~1,920 invoked tokens", qualities: [{label:"Guidance",score:8,word:"Strong"},{label:"Efficiency",score:8,word:"Strong"},{label:"Coverage",score:7,word:"Good"}], nodes: genericNodes, edges: [["trigger","inspect"],["inspect","execute"],["execute","verify"]] }),
  defineSkill({ slug: "spreadsheets", name: "Spreadsheets", owner: "openai", purpose: "Create and analyze structured workbooks with verification.", bestFor: "Models, cleanup, reporting, formulas, and charts.", power: 7550, installs: 603100, trend: 7, updatedDays: 11, category: "documents-data", tags: ["create","automate","research"], sourceTopics: ["Spreadsheets","Data"], scout: "Static inspection", footprint: "~2,180 invoked tokens", qualities: [{label:"Guidance",score:8,word:"Strong"},{label:"Efficiency",score:7,word:"Good"},{label:"Coverage",score:8,word:"Strong"}], nodes: genericNodes, edges: [["trigger","inspect"],["inspect","execute"],["execute","verify"]] }),
];

export const skillBySlug = (slug: string) => skills.find((skill) => skill.slug === slug);
