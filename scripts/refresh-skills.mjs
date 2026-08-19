import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://skills.sh/api/v1";
const DATA_DIR = path.join(process.cwd(), "data", "skills");
const SNAPSHOT_PATH = path.join(DATA_DIR, "top100.json");
const QUEUE_PATH = path.join(DATA_DIR, "audit-queue.json");
const AUDITS_PATH = path.join(DATA_DIR, "power-audits.json");
const includeSecurity = process.argv.includes("--security");
const token = process.env.VERCEL_OIDC_TOKEN;

if (!token) {
  throw new Error("VERCEL_OIDC_TOKEN is missing. Run `vercel env pull` first.");
}

const apiFetch = async (pathname) => {
  const response = await fetch(`${API}${pathname}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`${pathname} returned ${response.status}: ${await response.text()}`);
  }
  return response.json();
};

const mapLimit = async (items, limit, mapper) => {
  const output = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return output;
};

const readPrevious = async () => {
  try {
    return JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return { skills: [] };
    throw error;
  }
};

await mkdir(DATA_DIR, { recursive: true });

const previous = await readPrevious();
let audits = { audits: [] };
try {
  audits = JSON.parse(await readFile(AUDITS_PATH, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const auditById = new Map(audits.audits.map((audit) => [audit.id, audit]));
const previousById = new Map(previous.skills.map((skill) => [skill.id, skill]));
const leaderboard = await apiFetch("/skills?view=all-time&per_page=100");
const sourceCounts = leaderboard.data.reduce((counts, skill) => {
  counts[skill.source] = (counts[skill.source] ?? 0) + 1;
  return counts;
}, {});

const skills = await mapLimit(leaderboard.data, 10, async (skill, index) => {
  const detail = await apiFetch(`/skills/${skill.id}`);
  let security = null;
  if (includeSecurity) {
    try {
      security = await apiFetch(`/skills/audit/${skill.id}`);
    } catch (error) {
      if (!String(error.message).includes("returned 404")) throw error;
    }
  }
  const prior = previousById.get(skill.id);
  const fileBytes = detail.files?.reduce((total, file) => total + file.contents.length, 0) ?? 0;
  return {
    rank: index + 1,
    ...skill,
    hash: detail.hash ?? null,
    fileCount: detail.files?.length ?? 0,
    sourceBytes: fileBytes,
    sourceSkillCount: sourceCounts[skill.source],
    bundleSignal: sourceCounts[skill.source] > 1,
    security: security?.audits ?? prior?.security ?? null,
    status: !prior ? "new" : prior.hash !== detail.hash ? "changed" : "unchanged",
  };
});

const currentIds = new Set(skills.map((skill) => skill.id));
const exited = previous.skills
  .filter((skill) => !currentIds.has(skill.id))
  .map(({ id, rank, installs }) => ({ id, previousRank: rank, installs }));
const auditQueue = skills
  .filter((skill) => auditById.get(skill.id)?.hash !== skill.hash)
  .map(({ id, rank, hash, sourceBytes, bundleSignal }) => ({
    id,
    rank,
    hash,
    reason: auditById.has(id) ? "source-changed" : "unassessed",
    sourceBytes,
    bundleSignal,
  }));
const generatedAt = new Date().toISOString();

await writeFile(SNAPSHOT_PATH, `${JSON.stringify({ generatedAt, view: "all-time", total: leaderboard.pagination.total, skills, exited }, null, 2)}\n`);
await writeFile(QUEUE_PATH, `${JSON.stringify({ generatedAt, count: auditQueue.length, skills: auditQueue }, null, 2)}\n`);

const changed = skills.filter((skill) => skill.status === "changed").length;
const added = skills.filter((skill) => skill.status === "new").length;
console.log(`Refreshed ${skills.length} skills: ${added} new, ${changed} changed, ${exited.length} exited.`);
console.log(`Queued ${auditQueue.length} source-level Power audits.`);
