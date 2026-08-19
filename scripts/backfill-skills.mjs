import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://skills.sh/api/v1";
const DATA_DIR = path.join(process.cwd(), "data", "skills");
const SNAPSHOT_PATH = path.join(DATA_DIR, "top100.json");
const AUDITS_PATH = path.join(DATA_DIR, "power-audits.json");
const token = process.env.VERCEL_OIDC_TOKEN;

if (!token) throw new Error("VERCEL_OIDC_TOKEN is missing. Run `vercel env pull` first.");

const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));

const apiFetch = async (pathname) => {
  const response = await fetch(`${API}${pathname}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`${pathname} returned ${response.status}: ${await response.text()}`);
  return response.json();
};

const mapLimit = async (items, limit, mapper) => {
  const output = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await mapper(items[index], index);
      process.stdout.write(`\rInspected ${index + 1}/${items.length}`);
    }
  });
  await Promise.all(workers);
  process.stdout.write("\n");
  return output;
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
const words = (value) => value.trim().split(/\s+/).filter(Boolean);
const tokenEstimate = (value) => Math.ceil(value.length / 4);
const sentence = (value) => value.replace(/[`*_#[\]]/g, "").replace(/\s+/g, " ").trim().replace(/^[\d.)\-\s]+/, "");
const short = (value, length) => value.length <= length ? value : `${value.slice(0, length - 1).trim()}…`;
const slugify = (value, fallback) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || fallback;
const titleize = (value) => value.split(/[-_]/).map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
const stripFrontmatter = (markdown) => markdown.replace(/^---\n[\s\S]*?\n---\s*/, "");

function frontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const value = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) value[line.slice(0, colon).trim()] = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return value;
}

function extractActions(markdown) {
  const body = stripFrontmatter(markdown);
  const lines = body.split("\n");
  const headings = [];
  const items = [];
  let heading = "Workflow";
  let fenced = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("```")) { fenced = !fenced; continue; }
    if (fenced) continue;
    const headingMatch = line.match(/^#{2,3}\s+(.+)/);
    if (headingMatch) {
      heading = sentence(headingMatch[1]);
      if (!/^(overview|about|examples?|resources?|references?|when to .*|what is .*|contents?|quick reference.*|common .*categories|tips.*|rule categories.*)$/i.test(heading)) headings.push({ heading, text: heading });
      continue;
    }
    const item = line.match(/^(?:\d+[.)]|[-*])\s+(.+)/)?.[1];
    if (!item) continue;
    const clean = sentence(item.split(/\s{2,}|:\s+(?=[A-Z])/)[0]);
    if (clean.length < 8 || /^(example|note|tip|good to know|when to use)/i.test(clean)) continue;
    if (!/when to (?:use|apply)|trigger/i.test(heading)) items.push({ heading, text: clean });
  }
  const paragraphs = body.replace(/```[\s\S]*?```/g, "").split(/\n\s*\n/).map(sentence).filter((text) => text.length >= 28 && text.length <= 520 && !/^#|^\||^(?:name|description|metadata):|Call the Skill tool/i.test(text)).map((text) => ({ heading: "Workflow", text }));
  const actions = headings.length >= 3 ? headings : paragraphs.length >= 3 ? paragraphs : [...headings, ...items];
  const unique = [];
  const seen = new Set();
  for (const action of actions) {
    const key = action.text.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(action); }
  }
  return unique;
}

function nodeKind(text, index, total) {
  if (/repeat|retry|iterate|loop|continue until|again/i.test(text)) return "loop";
  if (/ask (?:the )?user|human|confirm|approve|choose|decision|select/i.test(text)) return "human";
  if (index === total - 1 && /return|render|write|save|record|report|deliver|create|produce|output|verify|validate/i.test(text)) return "artifact";
  return "agent";
}

function compileGraph(markdown, description) {
  const extracted = extractActions(markdown);
  const sourceSentences = stripFrontmatter(markdown)
    .split("\n")
    .map(sentence)
    .filter((line) => line.length >= 12 && !/^#|^```|^\|/.test(line));
  const fallback = [description, ...sourceSentences].filter(Boolean).slice(0, 3);
  while (fallback.length < 3) fallback.push(fallback[fallback.length - 1] ?? description);
  const selected = extracted.length >= 3
    ? extracted.slice(0, 7)
    : fallback.map((text, index) => ({ heading: ["Trigger", "Workflow", "Result"][index], text }));
  const nodes = selected.map((action, index) => {
    const kind = nodeKind(action.text, index, selected.length);
    const label = short(sentence(action.text).replace(/^(?:use|run|read|create|write|return|validate|verify)\s+/i, (match) => match), 38);
    return {
      id: slugify(`${action.heading}-${label}`, `step-${index + 1}`),
      kind,
      label: label[0]?.toUpperCase() + label.slice(1),
      note: short(action.heading, 26),
      summary: short(sentence(action.text), 150),
      actor: kind === "human" ? "Human + agent" : "Agent",
      output: kind === "artifact" ? "Verified result" : short(`${action.heading} result`, 42),
      source: short(sentence(action.text), 220),
    };
  });
  const used = new Map();
  for (const node of nodes) {
    const count = used.get(node.id) ?? 0;
    used.set(node.id, count + 1);
    if (count) node.id = `${node.id}-${count + 1}`;
  }
  const edges = nodes.slice(1).map((node, index) => [nodes[index].id, node.id]);
  const loopIndex = nodes.findIndex((node) => node.kind === "loop");
  if (loopIndex > 1) edges.push([nodes[loopIndex].id, nodes[loopIndex - 1].id]);
  return { nodes, edges };
}

function scoreSkill(markdown, files, description) {
  const body = stripFrontmatter(markdown);
  const bodyTokens = tokenEstimate(body);
  const headings = (body.match(/^#{2,3}\s+/gm) ?? []).length;
  const steps = (body.match(/^\s*(?:\d+[.)]|[-*])\s+/gm) ?? []).length;
  const codeBlocks = Math.floor((body.match(/```/g) ?? []).length / 2);
  const hasValidation = /validate|verify|test|check|assert|acceptance|completion/i.test(body);
  const hasFailure = /error|failure|fallback|missing|invalid|do not|never|avoid|limit/i.test(body);
  const hasExamples = /example|fixture|sample|scenario/i.test(body);
  const hasWorkflow = /workflow|steps|procedure|process|quick start/i.test(body) || steps >= 3;
  const hasScripts = files.some((file) => /(?:^|\/)scripts?\//i.test(file.path));
  const hasTests = files.some((file) => /test|spec|fixture/i.test(file.path));
  const references = files.filter((file) => /(?:^|\/)references?\//i.test(file.path)).length;
  const descriptionWords = words(description ?? frontmatter(markdown).description ?? "").length;
  const taskValue = clamp(66 + Math.min(12, descriptionWords / 2) + (hasWorkflow ? 5 : 0));
  const effectiveness = clamp(48 + Math.min(18, steps * 2) + Math.min(10, codeBlocks * 2) + (hasScripts ? 10 : 0) + (hasExamples ? 6 : 0));
  const reliability = clamp(44 + (hasValidation ? 16 : 0) + (hasFailure ? 10 : 0) + (hasTests ? 16 : 0) + (hasScripts ? 6 : 0));
  const efficiency = clamp(94 - Math.max(0, bodyTokens - 900) / 95 + (references ? 5 : 0) - (bodyTokens < 120 ? 10 : 0));
  const coverage = clamp(42 + Math.min(18, headings * 2) + (hasFailure ? 12 : 0) + (hasExamples ? 10 : 0) + Math.min(8, references * 2));
  const guidance = clamp(48 + Math.min(20, steps * 2) + (hasWorkflow ? 10 : 0) + (hasValidation ? 8 : 0) + Math.min(8, headings));
  const discoverability = clamp(58 + Math.min(24, descriptionWords));
  const power = Math.round(100 * (taskValue * .25 + effectiveness * .30 + reliability * .20 + efficiency * .15 + coverage * .10));
  const inputs = { taskValue, effectiveness, reliability, efficiency, coverage };
  const reasons = {
    taskValue: `Trigger description contains ${descriptionWords} words; workflow signal ${hasWorkflow ? "present" : "absent"}.`,
    effectiveness: `${steps} actionable list items, ${codeBlocks} code blocks, scripts ${hasScripts ? "present" : "absent"}.`,
    reliability: `Validation ${hasValidation ? "present" : "absent"}; failure guidance ${hasFailure ? "present" : "absent"}; tests ${hasTests ? "present" : "absent"}.`,
    efficiency: `Estimated activation body is ${bodyTokens.toLocaleString()} tokens across ${files.length} files with ${references} references.`,
    coverage: `${headings} sections; examples ${hasExamples ? "present" : "absent"}; boundary guidance ${hasFailure ? "present" : "absent"}.`,
  };
  return { power, bodyTokens, inputs, reasons, diagnostics: { guidance, discoverability } };
}

const wordLabel = (value) => value >= 90 ? "Excellent" : value >= 80 ? "Strong" : value >= 70 ? "Good" : value >= 60 ? "Capable" : value >= 50 ? "Limited" : "Weak";

async function resolveDetail(entry) {
  const detail = await apiFetch(`/skills/${entry.id}`);
  const skillFile = detail.files?.find((file) => /(^|\/)SKILL\.md$/i.test(file.path));
  const dependency = skillFile?.contents.match(/Call the Skill tool with ["'`]([^"'`]+)["'`]/i)?.[1];
  if (!dependency) return detail;
  try {
    const resolved = await apiFetch(`/skills/${entry.source}/${dependency}`);
    return { ...detail, files: [...(detail.files ?? []), ...(resolved.files ?? []).map((file) => ({ ...file, path: `dependency-${dependency}/${file.path}` }))], dependency: { id: resolved.id, hash: resolved.hash } };
  } catch {
    return detail;
  }
}

const audits = await mapLimit(snapshot.skills, 8, async (entry) => {
  const detail = await resolveDetail(entry);
  const files = detail.files ?? [];
  const skillFile = [...files].sort((a, b) => a.path.split("/").length - b.path.split("/").length).find((file) => /(^|\/)SKILL\.md$/i.test(file.path));
  if (!skillFile) throw new Error(`${entry.id} has no SKILL.md`);
  const dependencySkill = files.find((file) => /^dependency-[^/]+\/SKILL\.md$/i.test(file.path));
  const effectiveMarkdown = dependencySkill ? `${stripFrontmatter(skillFile.contents)}\n\n${stripFrontmatter(dependencySkill.contents)}` : skillFile.contents;
  const metadata = frontmatter(skillFile.contents);
  const description = sentence(metadata.description ?? "");
  const graph = compileGraph(effectiveMarkdown, description);
  const score = scoreSkill(effectiveMarkdown, files, description);
  const purpose = short(description || `${titleize(entry.slug)} workflow.`, 180);
  return {
    id: entry.id,
    hash: detail.hash,
    rubric: "skill-scouter-static-v1",
    inspectedAt: new Date().toISOString(),
    evidence: "deterministic static inspection",
    dependency: detail.dependency ?? null,
    power: score.power,
    inputs: score.inputs,
    reasons: score.reasons,
    diagnostics: score.diagnostics,
    footprint: `~${score.bodyTokens.toLocaleString()} activation tokens`,
    purpose,
    bestFor: short(`Requests that match the declared ${titleize(entry.slug)} trigger and workflow.`, 160),
    qualities: [
      ["Effectiveness", score.inputs.effectiveness],
      ["Reliability", score.inputs.reliability],
      ["Efficiency", score.inputs.efficiency],
      ["Coverage", score.inputs.coverage],
      ["Guidance", score.diagnostics.guidance],
      ["Discoverability", score.diagnostics.discoverability],
    ].map(([label, value]) => ({ label, score: Math.max(1, Math.min(10, Math.round(value / 10))), word: wordLabel(value) })),
    ...graph,
  };
});

const output = { version: 2, rubric: "skill-scouter-static-v1", generatedAt: new Date().toISOString(), audits };
await writeFile(AUDITS_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${audits.length} source-hashed Scouter reports and Skillprints.`);
