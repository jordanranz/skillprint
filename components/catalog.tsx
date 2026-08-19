"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogEntry } from "@/lib/catalog-data";
import { categories, categoryById, type CategoryId, type FunctionalTag } from "@/lib/taxonomy";
import { Header } from "./header";
import { ArrowIcon } from "./icons";
import { EcosystemFacts } from "./ecosystem-facts";

type Sort = "popular" | "power";
type CategoryFilter = "all" | CategoryId;

const labels: Record<Sort,string> = { popular: "Ranked by recorded installs", power: "Ranked by score" };
const formatInstalls = (value:number) => new Intl.NumberFormat("en-US", { notation:"compact", maximumFractionDigits:1 }).format(value);

const compactCategoryLabels: Record<CategoryId,string> = {
  "agent-skill-tools": "Agent tools",
  "communication-collaboration": "Communication",
  "design-ux": "Design & UX",
  development: "Development",
  "documents-data": "Documents & data",
  infrastructure: "Infrastructure",
  "media-creation": "Media creation",
  "planning-reasoning": "Planning",
};

function CategoryChip({ skill, compact = false }: { skill: Pick<CatalogEntry,"category">; compact?: boolean }) {
  const category = categoryById[skill.category];
  return <span className="category-chip" title={category.label} style={{"--category":category.color} as React.CSSProperties}><i/>{compact ? compactCategoryLabels[skill.category] : category.label}</span>;
}

export function Catalog({ ranking, generatedAt }: { ranking: CatalogEntry[]; generatedAt: string }) {
  const [sort,setSort] = useState<Sort>("popular");
  const [category,setCategory] = useState<CategoryFilter>("all");
  const [tags,setTags] = useState<FunctionalTag[]>([]);

  const categorySkills = useMemo(() => category === "all" ? ranking : ranking.filter(skill => skill.category === category), [ranking,category]);
  const availableTags = useMemo(() => Array.from(new Set(categorySkills.flatMap(skill => skill.tags))).sort(), [categorySkills]);
  const filtered = useMemo(() => [...categorySkills]
    .filter(skill => !tags.length || tags.some(tag => skill.tags.includes(tag)))
    .sort((a,b) => sort === "power" ? (b.power ?? -1)-(a.power ?? -1) || a.rank-b.rank : a.rank-b.rank), [categorySkills,tags,sort]);
  const featured = useMemo(() => [...ranking].filter(skill=>skill.power!==null).sort((a,b)=>(b.power??0)-(a.power??0)||a.rank-b.rank).slice(0,5),[ranking]);
  const chooseCategory = (next: CategoryFilter) => { setCategory(next); setTags([]); };
  const toggleTag = (tag: FunctionalTag) => setTags(current => current.includes(tag) ? current.filter(value => value !== tag) : [...current,tag]);

  return <><Header/><main>
    <section className="hero shell"><div><p className="eyebrow">The inspected skill catalog</p><h1>Find skills<br/>worth loading.</h1><p className="hero-copy">Compare what the ecosystem installs with what each skill appears capable of after inspection.</p><nav className="built-with" aria-label="Skills used to build Skillprint"><span>Built with</span><a href="https://github.com/jordanranz/skills/tree/main/skills/engineering/skillprint" target="_blank" rel="noreferrer">Skillprint ↗</a><a href="https://github.com/jordanranz/skills/tree/main/skills/engineering/skill-scouter" target="_blank" rel="noreferrer">Skill Scouter ↗</a></nav></div></section>
    <section className="shell featured"><div className="section-heading"><div><p className="eyebrow">Highest score</p><h2>Five exceptional Skillprints</h2></div><div className="scoring-context"><span>Scores update when source changes</span><details><summary>How scoring works</summary><div className="scoring-popover"><strong>Scouter Score · 10,000 points</strong><p>Deterministic inspection of the skill source.</p><dl><dt>Effectiveness</dt><dd>23%</dd><dt>Generality</dt><dd>20%</dd><dt>Task value</dt><dd>20%</dd><dt>Reliability</dt><dd>18%</dd><dt>Efficiency</dt><dd>11%</dd><dt>Coverage</dt><dd>8%</dd></dl><small>Generality rewards transferable guidance. Named platform dependencies reduce portability, but focused skills can still score highly through strong execution. Installs, stars, and forks never affect the score.</small></div></details></div></div><div className="power-deck">{featured.map((skill,index)=><Link className="power-card" href={`/skill/${skill.detailSlug}`} key={skill.id} style={{"--skill":skill.color,"--power":`${(skill.power??0)/100}%`} as React.CSSProperties}><div className="card-meta"><span>Score {index+1}</span><span className="card-tags">{skill.tags.slice(0,2).map(tag=><b key={tag}>{tag}</b>)}</span></div><CategoryChip skill={skill}/><h3>{skill.name}</h3><p>{skill.purpose}</p><div className="card-power"><strong>{skill.power?.toLocaleString()}</strong><span>/ 10,000</span></div><div className="power-track" aria-label={`${skill.power?.toLocaleString()} out of 10,000 Scouter Score`}><i/></div></Link>)}</div><p className="deck-hint" aria-hidden="true">Swipe to compare <span>→</span></p></section>
    <section className="shell ranking"><div className="section-heading rank-heading"><div><p className="eyebrow">Current top 100</p><h2>{labels[sort]}</h2></div><div className="sort-control" role="group" aria-label="Sort skills">{(["popular","power"] as Sort[]).map(value=><button key={value} className={sort===value?"active":""} onClick={()=>setSort(value)}>{value === "popular" ? "Popular" : "Score"}</button>)}</div></div>
      <div className="taxonomy-filter"><div className="category-filter" role="group" aria-label="Filter by category"><button className={category==="all"?"active":""} onClick={()=>chooseCategory("all")}><i/>All skills</button>{categories.map(item=><button key={item.id} className={category===item.id?"active":""} style={{"--category":item.color} as React.CSSProperties} onClick={()=>chooseCategory(item.id)}><i/>{item.label}</button>)}</div>{availableTags.length > 0 && <div className="tag-filter" role="group" aria-label="Refine by capability"><span>Refine</span>{availableTags.map(tag=><button key={tag} className={tags.includes(tag)?"active":""} aria-pressed={tags.includes(tag)} onClick={()=>toggleTag(tag)}>{tag}</button>)}</div>}</div>
      <div className="result-count"><span>{filtered.length} {filtered.length === 1 ? "skill" : "skills"}</span>{(category!=="all" || tags.length>0) && <button onClick={()=>{chooseCategory("all");setTags([]);}}>Clear filters</button>}</div>
      <div className={`skill-ledger sort-${sort}`}><div className="ledger-head"><span>All-time rank</span><span>Skill</span><span>Category</span><span>Purpose</span><span>Recorded installs</span><span>Score</span><span/></div>{filtered.length ? filtered.map((skill)=><Link className="skill-row" href={`/skill/${skill.detailSlug}`} key={skill.id} style={{"--category":skill.color} as React.CSSProperties}><span className="rank-number">{String(skill.rank).padStart(2,"0")}</span><span className="ledger-name"><b>{skill.name}</b><small>{skill.owner}</small>{skill.ecosystem && <EcosystemFacts ecosystem={skill.ecosystem}/>}</span><CategoryChip skill={skill} compact/><span className="ledger-purpose">{skill.catalogPurpose}</span><span className="ledger-installs"><b>{formatInstalls(skill.installs)}</b></span><span className={`ledger-power ${skill.power===null?"pending":""}`}><b>{skill.power?.toLocaleString() ?? "—"}</b><small>{skill.scout === "Not inspected" ? "Not scouted" : skill.scout}</small></span><ArrowIcon className="row-arrow"/></Link>) : <div className="empty-state"><strong>No matching skills</strong><span>Clear a filter or try another search.</span></div>}</div>
      <p className="data-note">skills.sh all-time recorded-install snapshot · all {ranking.length} eligible skills · updated {new Date(generatedAt).toLocaleString()} · rank movement is unavailable until a comparable historical snapshot exists.</p>
    </section>
  </main></>;
}
