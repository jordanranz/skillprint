---
title: Ship the public Skillprint MVP
labels:
  - wayfinder:map
status: open
---

## Destination

A deployed, public, read-only Skillprint MVP where skill consumers browse five skills in the Skill Explorer and open lazy-loaded skillprints explaining when, how, and through which workflow each skill operates.

## Notes

- This effort explicitly carries execution through deployment rather than stopping at a plan.
- Product: **Skillprint**. Catalog interface: **Skill Explorer**. Individual visualization: **skillprint**.
- Three positions are ranked by skills.sh CLI-recorded install counts; `grill-me` and `wayfinder` occupy two reserved positions.
- Each skillprint includes an interactive workflow diagram plus concise when/how guidance. Video is outside this MVP.
- Local Markdown is the issue tracker. Child tickets live in `tickets/`; `blocked_by` lists ticket filenames.
- A session resolves no more than one non-research ticket.

## Decisions so far

- [Find a trustworthy skill-level download source](tickets/01-find-download-data-source.md) — Use skills.sh CLI-recorded, hourly-deduplicated install counts with explicit provenance and coverage caveats.
- [Choose the download ranking window](tickets/02-choose-ranking-window.md) — Rank eligible skills by an all-time, deployment-time skills.sh snapshot behind a replaceable data provider.
- [Select the three download-ranked skills](tickets/03-select-ranked-skills.md) — The MVP set is `find-skills`, `grill-me`, `frontend-design`, `grill-with-docs`, and `wayfinder`.
- [Install the prototype workflow dependency](tickets/09-install-prototype-skill.md) — Installed Matt Pocock's prototype workflow for the upcoming human-in-the-loop interaction design.
- [Prototype the shared skillprint interaction language](tickets/04-prototype-skillprint-language.md) — Use Variant D: a compact responsive workflow linked to usage guidance, selected-node meaning, exact source provenance, and a deterministic preview; defer the editable authoring canvas.

## Not yet specified

- Accessibility requirements for navigating interactive graphs.
- Refresh cadence and behavior when ranking data changes.
- Visual identity beyond the settled naming system.
- Analytics needed to evaluate whether people understand a skill.
- Exact hosting provider and deployment workflow.

## Out of scope

- Accounts, login, personalization, and saved skills.
- Skill authoring or submission tools.
- Team evaluation and governance features.
- Running or installing skills from inside Skillprint.
- Video demonstrations.
- More than five skills.
