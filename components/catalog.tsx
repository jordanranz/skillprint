"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Skill } from "@/lib/skills";
import { Header } from "./header";
import { ArrowIcon } from "./icons";

type Sort = "popular" | "power" | "trending" | "updated";
const labels: Record<Sort,string> = { popular: "Ranked by recorded installs", power: "Ranked by inspected power", trending: "Fastest moving this week", updated: "Most recently inspected" };
const formatInstalls = (value:number) => `${Math.round(value / 1000)}K`;

export function Catalog({ skills }: { skills: Skill[] }) {
  const [sort,setSort] = useState<Sort>("popular"); const [search,setSearch] = useState("");
  const filtered = useMemo(() => [...skills].filter(skill => `${skill.name} ${skill.owner} ${skill.purpose}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => sort === "power" ? b.power-a.power : sort === "trending" ? b.trend-a.trend : sort === "updated" ? a.updatedDays-b.updatedDays : b.installs-a.installs), [skills,sort,search]);
  const featured = useMemo(() => [...skills].sort((a,b)=>b.power-a.power).slice(0,5),[skills]);
  return <><Header search={search} onSearch={setSearch}/><main>
    <section className="hero shell"><div><p className="eyebrow">The inspected skill catalog</p><h1>Find skills<br/>worth loading.</h1><p className="hero-copy">Compare what the ecosystem installs with what each skill appears capable of after inspection.</p><div className="metric-key" aria-label="Scoring key"><span><i className="metric-dot observed"/><b>Popularity</b> · recorded installs</span><span><i className="metric-dot assessed"/><b>Power</b> · Skillprint assessment</span><details><summary>How scoring works</summary><p>Power evaluates guidance, efficiency, coverage, and practical value. Popularity is observed ecosystem behavior; it does not increase a skill’s Power score.</p></details></div></div></section>
    <section className="shell featured"><div className="section-heading"><div><p className="eyebrow">Highest power</p><h2>Five exceptional Skillprints</h2></div><p>Power updates when source changes</p></div><div className="power-deck">{featured.map((skill,index)=><Link className="power-card" href={`/skill/${skill.slug}`} key={skill.slug} style={{"--skill":skill.color,"--power":`${skill.power/100}%`} as React.CSSProperties}><div className="card-meta"><span>Power {index+1}</span><b>{skill.scout}</b></div><h3>{skill.name}</h3><p>{skill.purpose}</p><div className="card-power"><strong>{skill.power.toLocaleString()}</strong><span>/ 10,000</span></div><div className="power-track"><i/></div></Link>)}</div></section>
    <section className="shell ranking"><div className="section-heading rank-heading"><div><p className="eyebrow">Top 100 preview</p><h2>{labels[sort]}</h2></div><div className="sort-control" role="group" aria-label="Sort skills">{(["popular","power","trending","updated"] as Sort[]).map(value=><button key={value} className={sort===value?"active":""} onClick={()=>setSort(value)}>{value === "popular" ? "Popular" : value[0].toUpperCase()+value.slice(1)}</button>)}</div></div>
      <div className="skill-ledger"><div className="ledger-head"><span>Rank</span><span>Skill</span><span>Purpose</span><span>Power</span><span>Installs</span><span/></div>{filtered.length ? filtered.map((skill,index)=><Link className="skill-row" href={`/skill/${skill.slug}`} key={skill.slug}><span className="rank-number">{String(index+1).padStart(2,"0")}</span><span className="ledger-name"><b>{skill.name}</b><small>{skill.owner}</small></span><span className="ledger-purpose">{skill.purpose}</span><span className="ledger-power"><b>{skill.power.toLocaleString()}</b><small>{skill.scout}</small></span><span className="ledger-installs"><b>{formatInstalls(skill.installs)}</b><small className={skill.trend>=0?"up":"down"}>{skill.trend>=0?"↑":"↓"}{Math.abs(skill.trend)}</small></span><ArrowIcon className="row-arrow"/></Link>) : <div className="empty-state"><strong>No matching skills</strong><span>Try a skill name, owner, or purpose.</span></div>}</div>
      <p className="data-note">Preview dataset · production rankings will use daily recon and cached Scout assessments.</p>
    </section>
  </main></>;
}
