---
title: Prototype the shared skillprint interaction language
labels:
  - wayfinder:prototype
status: closed
assignee: codex-root
blocked_by:
  - 09-install-prototype-skill.md
---

## Question

What common visual and interaction language makes five structurally different agent skills understandable without forcing every workflow into the same shape?

## Resolution comment

Select Variant D as the public Skill Explorer interaction language. A skillprint combines:

- a compact, responsive directed workflow whose nodes use semantic instruction types and short outcome copy;
- actor color as a secondary cue rather than the primary meaning;
- a single evidence column containing Trigger/Input/Result, selected-node explanation, and exact governing source;
- direct, source-backed selection between diagram nodes and instruction passages;
- a deterministic “Try it” walkthrough that previews the expected interaction without executing the skill;
- light and dark themes plus desktop, split-view, and mobile layouts.

The public diagram favors glanceable route comprehension; longer behavioral detail stays in the evidence column. Variant E's generated/editable canvas is a separate future authoring surface and remains outside the read-only MVP.

Prototype asset: [`outputs/skillprint-prototype/index.html`](../../../outputs/skillprint-prototype/index.html), Variant D.
