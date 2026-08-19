# Skillprint

A minimal web app for discovering popular agent skills and understanding how each one works. Its catalog interface is the **Skill Explorer**; each interactive workflow visualization is a **skillprint**.

## Product hypothesis

Skill directories are easy to browse but hard to understand. Skillprint should make a skill legible in under a minute by combining a ranked catalog with an interactive workflow view, concise usage guidance, and an optional short demo.

## Current prototype

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

## Prototype links

- `outputs/skillprint-home-prototype/index.html` — catalog exploration with three switchable variants.
- `outputs/skillprint-prototype/index.html` — interactive workflow inspector.
- `outputs/skillprint-vercel/` — static deployment package used by Vercel.

Live prototype: https://skillprint-vercel-delta.vercel.app

## Refresh model

- Refresh rank, recorded installs, stars, and source hashes daily without an LLM.
- Rescout newly entered or source-changed skills immediately.
- Run a token-budgeted audit of the Top 100 weekly.
- Reuse cached Skillprints when neither the source nor the scouting rubric changed.

## First visualization concepts

### grill-me

A branching interview tree. The active question is highlighted, answered branches collapse into decisions, unresolved branches remain visible, and a progress indicator reflects decision coverage rather than question count.

### wayfinder

A fog-of-war map. The destination anchors the graph; unresolved decision tickets form the frontier; resolved tickets reveal the route. Ticket types such as research, prototype, grilling, and task use distinct node treatments.

## Decisions to resolve before implementation

1. Who is the first user: skill consumers, skill authors, or teams evaluating skills?
2. Which skills.sh install-count window should rank the three non-reserved positions?
3. Is this a read-only catalog or should users be able to run/sample skills?
4. Which skill formats and hosts are supported in v1?
5. Should workflow diagrams be hand-authored, parsed from `SKILL.md`, AI-generated with review, or hybrid?
6. Are videos embedded from authors, recorded in-house, or deferred until after the interactive diagrams?

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
