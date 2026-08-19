---
title: Find a trustworthy skill-level download source
labels:
  - wayfinder:research
status: closed
assignee: download_source_research
blocked_by: []
---

## Question

Which available source provides transparent, reproducible skill-level download or installation counts suitable for ranking three skills in the public MVP?

## Resolution comment

Use skills.sh as the MVP's skill-level ranking source. Its integer counts are hourly-deduplicated installs reported by the skills CLI—not downloads or actual usage. Use the documented authenticated v1 API, retain an `asOf` timestamp and source parameters, exclude records flagged as duplicates, and disclose coverage gaps. [Research artifact](../research/01-download-data-source.md)
