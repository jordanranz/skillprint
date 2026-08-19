"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Skill } from "@/lib/skills";
import { categoryById } from "@/lib/taxonomy";
import { NodeIcon, SunIcon } from "./icons";

type Point = { x:number; y:number };
const positions: Record<number, Point[]> = {
  4: [{x:50,y:10},{x:50,y:37},{x:50,y:64},{x:50,y:88}],
  5: [{x:50,y:7},{x:29,y:33},{x:71,y:33},{x:50,y:62},{x:50,y:88}],
  6: [{x:50,y:5},{x:28,y:30},{x:72,y:30},{x:28,y:61},{x:72,y:61},{x:50,y:89}],
};

export function WorkflowExplorer({ skill }: { skill: Skill }) {
  const [selected,setSelected] = useState(0); const [theme,setTheme] = useState("dark"); const [sheet,setSheet] = useState(false); const [pan,setPan] = useState<Point>({x:0,y:0});
  const viewportRef=useRef<HTMLDivElement>(null); const boardRef=useRef<HTMLDivElement>(null); const drag=useRef<{id:number;x:number;y:number;origin:Point;moved:boolean}|null>(null);
  const coords=useMemo(()=>positions[skill.nodes.length] ?? skill.nodes.map((_,i)=>({x:50,y:8+i*(84/Math.max(skill.nodes.length-1,1))})),[skill.nodes]);
  const node=skill.nodes[selected];
  useEffect(()=>{document.documentElement.dataset.theme=theme},[theme]);
  const clamp=useCallback((point:Point)=>{const viewport=viewportRef.current,board=boardRef.current;if(!viewport||!board)return point;const margin=36;const nodes=[...board.querySelectorAll<HTMLElement>("[data-node]")];if(!nodes.length)return point;const minX=Math.min(...nodes.map(n=>n.offsetLeft)),maxX=Math.max(...nodes.map(n=>n.offsetLeft+n.offsetWidth)),minY=Math.min(...nodes.map(n=>n.offsetTop)),maxY=Math.max(...nodes.map(n=>n.offsetTop+n.offsetHeight));const bounds={minX:viewport.clientWidth-margin-maxX,maxX:margin-minX,minY:viewport.clientHeight-margin-maxY,maxY:margin-minY};if(maxX-minX<viewport.clientWidth-margin*2)bounds.minX=bounds.maxX=(viewport.clientWidth-minX-maxX)/2;if(maxY-minY<viewport.clientHeight-margin*2)bounds.minY=bounds.maxY=(viewport.clientHeight-minY-maxY)/2;return{x:Math.max(bounds.minX,Math.min(bounds.maxX,point.x)),y:Math.max(bounds.minY,Math.min(bounds.maxY,point.y))}},[]);
  const focusNode=useCallback((index:number,open=true)=>{setSelected(index);if(open)setSheet(true);requestAnimationFrame(()=>{const viewport=viewportRef.current,el=boardRef.current?.querySelector<HTMLElement>(`[data-node="${index}"]`);if(!viewport||!el)return;const next={x:viewport.clientWidth/2-(el.offsetLeft+el.offsetWidth/2),y:viewport.clientHeight/2-(el.offsetTop+el.offsetHeight/2)};setPan(clamp(next))})},[clamp]);
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(!["ArrowLeft","ArrowRight"].includes(event.key)||/INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName))return;event.preventDefault();focusNode(Math.max(0,Math.min(skill.nodes.length-1,selected+(event.key==="ArrowRight"?1:-1))),false)};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[focusNode,selected,skill.nodes.length]);
  useEffect(()=>{const onResize=()=>setPan(current=>clamp(current));window.addEventListener("resize",onResize);return()=>window.removeEventListener("resize",onResize)},[clamp]);
  const down=(event:ReactPointerEvent)=>{if(event.button!==0||(event.target as HTMLElement).closest("button,a,[data-node]"))return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,origin:pan,moved:false};event.currentTarget.setPointerCapture(event.pointerId)};
  const move=(event:ReactPointerEvent)=>{const state=drag.current;if(!state||state.id!==event.pointerId)return;const dx=event.clientX-state.x,dy=event.clientY-state.y;if(Math.hypot(dx,dy)>4)state.moved=true;setPan(clamp({x:state.origin.x+dx,y:state.origin.y+dy}))};
  const up=(event:ReactPointerEvent)=>{if(drag.current?.id===event.pointerId)drag.current=null};
  const line=(from:string,to:string)=>{const a=skill.nodes.findIndex(n=>n.id===from),b=skill.nodes.findIndex(n=>n.id===to),A=coords[a],B=coords[b];return {x1:A.x,y1:A.y,x2:B.x,y2:B.y};};
  return <div className="detail-app">
    <header className="detail-top"><Link href="/" className="brand"><span className="brand-mark">S</span><span>Skillprint</span></Link><span className="detail-skill-name">{skill.name}</span><div className="detail-tools"><Link href="/" className="catalog-link">Browse skills</Link><button className="icon-button" onClick={()=>setTheme(theme==="dark"?"light":"dark")} aria-label="Toggle color theme"><SunIcon/></button></div></header>
    <main className="detail-main">
      <section className="detail-intro"><div><p className="eyebrow">Workflow inspection</p><h1>{skill.name}</h1><span className="category-chip detail-category" style={{"--category":skill.color} as React.CSSProperties}><i/>{categoryById[skill.category].label}</span></div><p>{skill.purpose}</p><div className="intro-rank"><span>Power</span><strong>{skill.power.toLocaleString()}</strong><small>{skill.scout}</small></div></section>
      <div className="detail-grid">
        <section className="workflow-viewport" ref={viewportRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label={`${skill.name} workflow`}>
          <div className="board-label label-a">Start</div><div className="board-label label-b">Work</div><div className="board-label label-c">Result</div>
          <div className="workflow-board" ref={boardRef} style={{transform:`translate3d(${pan.x}px,${pan.y}px,0)`}}>
            <svg className="workflow-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L8 4 0 8z"/></marker></defs>{skill.edges.map(([a,b])=>{const l=line(a,b);return <path key={`${a}-${b}`} className={skill.nodes[selected].id===a||skill.nodes[selected].id===b?"active":""} d={`M${l.x1} ${l.y1} C ${l.x1} ${(l.y1+l.y2)/2}, ${l.x2} ${(l.y1+l.y2)/2}, ${l.x2} ${l.y2}`} markerEnd="url(#arrow)"/>})}</svg>
            {skill.nodes.map((item,index)=><button key={item.id} data-node={index} className={`workflow-node ${item.kind} ${selected===index?"selected":""}`} style={{left:`calc(${coords[index].x}% - 74px)`,top:`calc(${coords[index].y}% - 34px)`,"--skill":skill.color} as React.CSSProperties} onClick={()=>focusNode(index)}><span className="node-symbol"><NodeIcon kind={item.kind}/></span><span><small>{item.kind}</small><b>{item.label}</b><em>{item.note}</em></span></button>)}
          </div>
          <div className="drag-hint">Drag canvas to explore</div>
          <nav className="sequence" aria-label="Workflow sequence"><button disabled={selected===0} onClick={()=>focusNode(selected-1,false)} aria-label="Previous step">←</button><span><small>Step</small><b>{selected+1} / {skill.nodes.length}</b></span><button disabled={selected===skill.nodes.length-1} onClick={()=>focusNode(selected+1,false)} aria-label="Next step">→</button></nav>
        </section>
        <aside className={`skill-inspector ${sheet?"open":""}`}><button className="sheet-handle" onClick={()=>setSheet(!sheet)}><span/><small>Selected step</small><b>{node.label}</b><i>{sheet?"×":"↑"}</i></button>
          <section className="inspector-block scout-block"><div className="block-heading"><p className="eyebrow">Scout reading</p><span>{skill.scout}</span></div><div className="scout-line"><div><small>Power level</small><strong style={{color:skill.color}}>{skill.power.toLocaleString()}</strong></div><dl><dt>Footprint</dt><dd>{skill.footprint}</dd><dt>Recorded installs</dt><dd>{skill.installs.toLocaleString()}</dd></dl></div><div className="quality-list">{skill.qualities.map(q=><div key={q.label}><span>{q.label}</span><i>{Array.from({length:10},(_,i)=><b key={i} className={i<q.score?"on":""} style={{"--skill":skill.color} as React.CSSProperties}/>)}</i><em>{q.word}</em></div>)}</div><p className="method-note">Power is our assessment. Rank is ecosystem behavior.</p></section>
          <section className="inspector-block"><p className="eyebrow">Selected step</p><div className="selected-title"><h2>{node.label}</h2><span>{node.kind}</span></div><p className="selected-summary">{node.summary}</p><dl className="fact-list"><dt>Actor</dt><dd>{node.actor}</dd><dt>Output</dt><dd>{node.output}</dd></dl></section>
          <section className="inspector-block source-block"><div className="block-heading"><p className="eyebrow">Source trace</p><span>Direct source</span></div><strong>SKILL.md · {node.label}</strong><blockquote>{node.source}</blockquote></section>
          <section className="inspector-block"><p className="eyebrow">Best for</p><p className="best-for">{skill.bestFor}</p><a className="correction-link" href={`https://github.com/jordanranz/skillprint/issues/new?title=${encodeURIComponent(`Category correction: ${skill.name}`)}`} target="_blank" rel="noreferrer">Suggest a classification correction</a></section>
        </aside>
      </div>
    </main>
  </div>;
}
