import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const exec = promisify(execFile);
const DATA_DIR = path.join(process.cwd(), "data", "skills");
const snapshot = JSON.parse(await readFile(path.join(DATA_DIR, "top100.json"), "utf8"));
const sources = [...new Set(snapshot.skills.slice(0, 10).map((skill) => skill.source))];
const since = new Date(Date.now() - 30 * 864e5).toISOString();

async function github(pathname) {
  const { stdout } = await exec("gh", ["api", pathname]);
  return JSON.parse(stdout);
}

const repositories = {};
for (const source of sources) {
  const repo = await github(`repos/${source}`);
  const commits = await github(`repos/${source}/commits?since=${encodeURIComponent(since)}&per_page=100`);
  repositories[source] = {
    source,
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    pushedAt: repo.pushed_at,
    updatedAt: repo.updated_at,
    commits30d: commits.length,
    commits30dCapped: commits.length === 100,
  };
  console.log(`${source}: ${repo.stargazers_count.toLocaleString()} stars, ${commits.length}${commits.length === 100 ? "+" : ""} commits/30d`);
}

await writeFile(path.join(DATA_DIR, "ecosystem-top10.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), rankLimit: 10, repositories }, null, 2)}\n`);
