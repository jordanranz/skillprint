import type { Skill } from "@/lib/skills";

const compact = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export function EcosystemFacts({ ecosystem, detailed = false }: { ecosystem: NonNullable<Skill["ecosystem"]>; detailed?: boolean }) {
  const facts = <>
    <span title="GitHub stars"><b>★</b> {compact(ecosystem.stars)}</span>
    <span title="GitHub forks"><b>⑂</b> {compact(ecosystem.forks)}</span>
    <span title="Repository commits in the last 30 days"><b>↻</b> {ecosystem.commits30d}{ecosystem.commits30dCapped ? "+" : ""}/30d</span>
    {detailed && <span title="Latest repository push"><b>↑</b> {ecosystem.pushedAt.slice(0, 10)}</span>}
  </>;
  return detailed
    ? <a className="ecosystem-facts detailed" href={ecosystem.url} target="_blank" rel="noreferrer">{facts}</a>
    : <span className="ecosystem-facts">{facts}</span>;
}
