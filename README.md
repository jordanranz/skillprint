# Skillprint

A minimal web app for discovering popular agent skills and understanding how each one works. Its catalog interface is the **Skill Explorer**; each interactive workflow visualization is a **skillprint**.

## Product hypothesis

Skill directories are easy to browse but hard to understand. Skillprint should make a skill legible in under a minute by combining a ranked catalog with an interactive workflow view, concise usage guidance, and an optional short demo.

## MVP

- Browse a Top 100-style catalog ranked by recorded installs, assessed Power, trend, or freshness.
- Feature five high-Power skills above the ranked catalog.
- Serve skill consumers discovering agent skills, without authoring or team-evaluation features.
- Keep ecosystem rank distinct from Skillprint's Power assessment.
- Open a skill detail page with:
  - what it is for;
  - when to use it;
  - invocation and prerequisites;
  - an interactive workflow diagram;
  - source and installation links;
  - concise guidance on when and how to use it.
- Ship `grill-me` and `wayfinder` as the two reference visualizations.
- Label ranking provenance clearly; do not imply that popularity equals usage unless the data source measures actual usage.
- Render the catalog shell and lightweight metadata immediately; lazy-load interactive diagrams and videos when they enter the viewport or their detail view opens.
- Deploy as a public, read-only site with no login.

The current implementation is a Next.js App Router application with a typed,
static skill catalog. It includes eight sample skills, the five-skill Power
leaderboard, search and sorting, responsive light/dark themes, and interactive
workflow explorers for every skill.

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` and `npm run lint` before
publishing.

## Prototype links

- `outputs/skillprint-home-prototype/index.html` — catalog exploration with three switchable variants.
- `outputs/skillprint-prototype/index.html` — interactive workflow inspector.
- `outputs/skillprint-vercel/` — static deployment package used by Vercel.

Live prototype: https://skillprint-vercel-delta.vercel.app

## Refresh model

- Refresh rank, recorded installs, stars, and source hashes daily without an LLM.
- Compile all current Top 100 skills once, then rebuild newly entered or source-changed skills immediately.
- Reuse cached Skillprints when neither the source nor the scouting rubric changed.
- Refresh repository-level stars, forks, freshness, and 30-day activity for the Top 10 popular skills.

Run `npm run refresh:skills` after `vercel env pull` to rebuild the official
skills.sh all-time Top 100 snapshot. The refresh fetches stable IDs, current
rank and installs, content hashes, source size, and bundle signals. It writes:

- `data/skills/top100.json` — the reproducible leaderboard manifest;
- `data/skills/audit-queue.json` — skills whose current hash has not been assessed;
- `data/skills/power-audits.json` — cached Scouter assessments and source-traced Skillprints keyed by skill ID and hash.

Pass `-- --security` to include partner security-audit results. The default
readiness boundary is the full Top 100, and any previously assessed skill is
requeued immediately when its source hash changes. Override the boundary with
`-- --audit-limit=25` (or any value from 0–100) for diagnostics. Run
`npm run backfill:skills` to compile queued source into cached scores and
diagrams, and `npm run verify:skills` to enforce that all 100 are ready. These
steps are deterministic and use no LLM tokens.

Run `npm run refresh:ecosystem` with an authenticated GitHub CLI to update
`data/skills/ecosystem-top10.json`. These repository-level adoption and
maintenance signals are displayed separately and never alter Scouter Score.

Static rubric v3 treats structured lists and well-formed prose equally. It
recognizes imperative guidance, adaptive loops, stopping conditions,
constraints, self-critique, examples, validation, executable evidence, and
generality across tools and platforms. Generality contributes 20%: named
platform dependencies reduce transferable value without making a focused
skill inherently low quality.
Popularity never contributes to the score, and missing observed-run evidence
still limits effectiveness and reliability claims.

## First visualization concepts

### grill-me

A branching interview tree. The active question is highlighted, answered branches collapse into decisions, unresolved branches remain visible, and a progress indicator reflects decision coverage rather than question count.

### wayfinder

A fog-of-war map. The destination anchors the graph; unresolved decision tickets form the frontier; resolved tickets reveal the route. Ticket types such as research, prototype, grilling, and task use distinct node treatments.

## Current product decisions

1. The first user is a skill consumer deciding what is worth loading.
2. Popularity and assessed Power remain separate signals.
3. The MVP is a public, read-only catalog with deterministic previews.
4. Workflow data is deterministically compiled from source and cached by source hash.
5. The catalog can refresh cheaply each day; source-changed and newly entered
   skills are rebuilt separately from the full cached Top 100 baseline.
6. Video is deferred until the workflow explorer proves useful on its own.
7. Every skill has one versioned primary category based on its principal user
   outcome. Controlled functional tags refine category browsing; source topics,
   provenance, and audit status remain separate metadata.

## Catalog taxonomy (v1)

The eight primary categories are Agent & Skill Tools, Communication &
Collaboration, Design & UX, Development, Documents & Data, Infrastructure,
Media Creation, and Planning & Reasoning. Category colors are stable catalog
accents and never encode Power or audit state.

Classification prefers declared metadata, then deterministic rules, then an
LLM fallback. It is recalculated only when the source hash or taxonomy version
changes. The controlled functional tags are `create`, `review`, `plan`,
`research`, `diagnose`, `automate`, `teach`, and `deploy`.

## Suggested implementation shape

- Next.js + TypeScript for the app.
- React Flow for interactive skill diagrams.
- Static, versioned skill metadata for the first release.
- A small ingestion pipeline that preserves source URLs, versions, and ranking provenance.
- No database until editing, accounts, or automated refreshes justify one.

## Planning sequence

1. Use `grill-me` to sharpen audience, ranking, and core interaction.
2. Use `wayfinder` if the remaining decisions are too broad for one session.
3. Turn resolved decisions into a one-page product spec.
4. Prototype the two reference diagrams before building catalog infrastructure.
5. Validate with the five-skill dataset before considering a larger catalog.
