---
title: Choose the download ranking window
labels:
  - wayfinder:grilling
status: closed
assignee: codex-root
blocked_by:
  - 01-find-download-data-source.md
---

## Question

Should Skill Explorer rank by recent downloads, lifetime downloads, or another window supported by the chosen data source?

## Resolution comment

Rank eligible skills by all-time skills.sh recorded install counts from a timestamped deployment-time snapshot. Exclude detected duplicates, skip entries lacking the public source material needed for a complete skillprint, and break equal-count ties alphabetically by stable skill ID. Read ranking data through a replaceable provider interface so future daily or runtime refreshes do not require redesigning Skill Explorer; automated refresh is not part of the MVP.
