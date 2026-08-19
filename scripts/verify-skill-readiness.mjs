import { readFile } from "node:fs/promises";

const snapshot = JSON.parse(await readFile(new URL("../data/skills/top100.json", import.meta.url), "utf8"));
const reports = JSON.parse(await readFile(new URL("../data/skills/power-audits.json", import.meta.url), "utf8"));
const byId = new Map(reports.audits.map((report) => [report.id, report]));
const failures = [];

for (const skill of snapshot.skills) {
  const report = byId.get(skill.id);
  if (!report) { failures.push(`${skill.id}: missing report`); continue; }
  if (report.hash !== skill.hash) failures.push(`${skill.id}: stale source hash`);
  if (!Number.isInteger(report.power) || report.power < 0 || report.power > 10000) failures.push(`${skill.id}: invalid score`);
  if (!Array.isArray(report.nodes) || report.nodes.length < 3) failures.push(`${skill.id}: incomplete Skillprint`);
  if (!Array.isArray(report.edges) || report.edges.length < report.nodes.length - 1) failures.push(`${skill.id}: incomplete edges`);
  if (report.nodes?.some((node) => !node.source || !node.id || !node.label)) failures.push(`${skill.id}: untraceable node`);
}

if (byId.size !== snapshot.skills.length) failures.push(`report count ${byId.size} does not match snapshot count ${snapshot.skills.length}`);
if (failures.length) {
  console.error(`Top 100 readiness failed (${failures.length}):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`Top 100 ready: ${snapshot.skills.length}/${snapshot.skills.length} scored, source-traced Skillprints.`);
