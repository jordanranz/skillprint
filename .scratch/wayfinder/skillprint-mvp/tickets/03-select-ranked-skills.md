---
title: Select the three download-ranked skills
labels:
  - wayfinder:task
status: closed
assignee: codex-root
blocked_by:
  - 01-find-download-data-source.md
  - 02-choose-ranking-window.md
---

## Question

Using the settled source and ranking window, which three skills join `grill-me` and `wayfinder` in the MVP?

## Resolution comment

Using the public skills.sh all-time leaderboard snapshot retrieved on 2026-08-17, reserve `grill-me` and select the first three eligible non-reserved entries:

1. [`find-skills`](https://www.skills.sh/vercel-labs/skills/find-skills) (`vercel-labs/skills`) — approximately 3.0M recorded installs.
2. [`frontend-design`](https://www.skills.sh/anthropics/skills/frontend-design) (`anthropics/skills`) — approximately 786.0K recorded installs.
3. [`grill-with-docs`](https://www.skills.sh/mattpocock/skills/grill-with-docs) (`mattpocock/skills`) — approximately 749.9K recorded installs.

Together with the two reserved reference skills, the MVP set is `find-skills`, `grill-me`, `frontend-design`, `grill-with-docs`, and `wayfinder`. Counts shown here are the rounded public leaderboard labels; the future deployment snapshot provider should retain exact API integers and its retrieval timestamp.
