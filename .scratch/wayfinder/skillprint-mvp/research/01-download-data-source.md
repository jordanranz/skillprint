# Skill-level install-count source research

Research date: 2026-08-17

## Finding

The only first-party source found that exposes cross-repository, skill-level install counts suitable for a reproducible leaderboard is **skills.sh**, backed by the open-source `vercel-labs/skills` CLI. Its documented v1 API returns stable skill IDs and integer install counts, and supports leaderboard pagination and multiple ranking views.

This is an install-telemetry dataset, not a universal measure of skill usage. It counts installs observed by the `skills` CLI; installs performed by other methods, telemetry-disabled users, and CI are absent.

## What is available

| Property | Evidence / interpretation |
|---|---|
| Unit | A skill identified by stable `"{source}/{slug}"` ID; GitHub-backed skills retain `owner/repo` as `source`. |
| Count | `installs` is an integer. The detail endpoint defines it as the **total deduplicated install count**. |
| All-time view | `GET /api/v1/skills?view=all-time`; this is the default view and can be paginated with `page` and `per_page` (1–500). |
| Recent view | `view=trending`; the public leaderboard labels this **Trending (24h)**. The API documentation describes it only as “recent growth,” so the page label is the clearest published window definition found. |
| Hot view | `view=hot`; documented as the current hour compared with the same hour yesterday, with `installsYesterday` and `change`. |
| Skill detail | `GET /api/v1/skills/{source}/{skill}` returns the skill ID, source, slug, total installs, content hash, and file tree when available. |
| Duplicates | Listing results may contain `isDuplicate: true`, enabling callers to exclude detected forks/copies. |
| Cache cadence | The API documentation says leaderboard/search responses cache for 30–60 seconds and skill detail responses for five minutes. |

The API shape is sufficient to reproduce a “top N by all-time installs” query: request `view=all-time`, sort/consume the returned order, retain the exact integer counts, record retrieval time, and filter `isDuplicate` according to a declared rule.

## How counts are produced

skills.sh states that its leaderboard is based on anonymous telemetry emitted when the open-source `skills` CLI installs a skill. The privacy page gives the event granularity: skill identifier (`owner / repo / skill name`), agent name, coarse timestamp, and a short IP-derived/JA4 fingerprint used for hourly deduplication. The fingerprint is discarded after aggregation.

The CLI source corroborates the granularity. An install telemetry event contains `source`, `skills`, and `agents`, plus optional scope, file-path, install-URL, metadata, and source-type fields. Telemetry can be disabled with `DISABLE_TELEMETRY` or `DO_NOT_TRACK`, and the CLI documentation says it is automatically disabled in CI.

Therefore, the public number is best described as **“deduplicated installs recorded by the skills.sh CLI”**, not “downloads,” “active users,” or “times the skill was invoked.”

## Access, rate limits, and terms

The documented v1 API requires a Vercel OIDC bearer token. A deployed Vercel project can obtain a short-lived token automatically; local development requires linking the project through the Vercel CLI. The documented authenticated limit is 600 requests/minute per team and project. Requests may return 401, 429, or 503; normal caching and retry/backoff are required.

There is also a legacy unauthenticated search endpoint used directly by the open-source CLI (`/api/search`). It returns skill-level install counts for search results, but it is not a complete leaderboard interface and is therefore unsuitable for reproducibly selecting the global top three.

The public-facing privacy and terms pages call install counts public and encourage reasonable cached API use. The terms prohibit abuse and rate-limit bypass. They also disclaim availability, accuracy, and completeness. There is a documentation inconsistency worth retaining in implementation notes: the terms describe rate limiting “per IP,” while the current v1 API reference describes authenticated limits per Vercel team/project.

## Coverage and reproducibility limitations

1. **CLI-specific coverage.** Counts omit Git clones, manual copies, other package managers, direct marketplace installs, and any other path that does not emit skills.sh telemetry.
2. **Opt-out and CI gaps.** Users can disable telemetry, and the CLI disables it in CI. The count is therefore a lower-bound sample, not an ecosystem-wide census.
3. **Install is not use.** Reinstallation, installation to multiple agents, and later removal or non-use can all diverge from actual invocation/adoption. Public docs do not publish the complete aggregation formula beyond hourly anti-replay deduplication.
4. **Mutable rankings.** Counts and rank change continuously. A reproducible snapshot needs an `asOf` timestamp and stored raw response (or at least IDs, counts, view, and query parameters).
5. **Indexing gaps.** A valid/installable GitHub skill may not yet be indexed or searchable. The registry therefore cannot establish the global popularity of every existing agent skill.
6. **Window ambiguity outside all-time.** “Trending” is labeled 24h on the site, but the API reference calls it recent growth without defining its calculation. “All-time installs” has the clearest published semantics.
7. **Service dependency.** The API is provided as-is, with no availability or accuracy guarantee, and v1 programmatic access currently couples deployment/local setup to Vercel OIDC.
8. **Duplicate handling is policy-sensitive.** The API flags detected copies, but does not mandate whether consumers must exclude them. Any ranking must record its filtering rule.

## Other sources considered

- **GitHub stars:** official and reproducible at repository level, but not skill level when repositories contain multiple skills; they measure repository interest rather than installs.
- **npm download counts:** official at package/version granularity, not at the individual `SKILL.md` level inside a multi-skill repository or package.
- **Third-party skill directories:** some republish skills.sh leaderboards, but they add another cache/crawler layer and are not more authoritative than the originating dataset.

## Sources

- [skills.sh API reference](https://www.skills.sh/docs/api) — endpoint schemas, stable IDs, views, count definition, authentication, caching, and rate limits.
- [skills.sh documentation](https://www.skills.sh/docs) — leaderboard provenance and CLI telemetry description.
- [skills.sh privacy](https://www.skills.sh/privacy) — event fields, hourly deduplication, public-data statement, and opt-out effect.
- [skills.sh terms](https://www.skills.sh/terms) — API-use conditions, caching allowance, and accuracy/availability disclaimer.
- [skills.sh Trending leaderboard](https://www.skills.sh/trending) — published “Trending (24h)” label and skill-level results.
- [`vercel-labs/skills` CLI telemetry source](https://github.com/vercel-labs/skills/blob/main/src/telemetry.ts) — emitted install-event fields and telemetry opt-out implementation.
- [`vercel-labs/skills` search source](https://github.com/vercel-labs/skills/blob/main/src/find.ts) — unauthenticated legacy search endpoint and its returned skill-level `installs` field.
- [`vercel-labs/skills` README](https://github.com/vercel-labs/skills/blob/main/README.md) — supported install commands, opt-out environment variables, and CI behavior.

