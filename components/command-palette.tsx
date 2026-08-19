"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { catalogEntries } from "@/lib/catalog-data";
import { categoryById } from "@/lib/taxonomy";
import { SearchIcon } from "./icons";

const normalize=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"");

export function CommandPalette({ compact=false }: { compact?: boolean }) {
  const router=useRouter();
  const inputRef=useRef<HTMLInputElement>(null);
  const openRef=useRef(false);
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [active,setActive]=useState(0);
  const results=useMemo(()=>{const terms=query.trim().split(/\s+/).map(normalize).filter(Boolean);const matches=catalogEntries.filter(skill=>{const searchable=normalize(`${skill.name} ${skill.owner} ${skill.purpose} ${categoryById[skill.category].label} ${skill.tags.join(" ")}`);return terms.every(term=>searchable.includes(term))});return matches.slice(0,terms.length?20:8)},[query]);

  useEffect(()=>{const listener=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();if(openRef.current){openRef.current=false;setOpen(false);setQuery("")}else{openRef.current=true;setActive(0);setOpen(true)}}};document.addEventListener("keydown",listener);return()=>document.removeEventListener("keydown",listener)},[]);
  useEffect(()=>{if(!open)return;requestAnimationFrame(()=>inputRef.current?.focus())},[open]);
  const show=()=>{openRef.current=true;setActive(0);setOpen(true)};
  const close=()=>{openRef.current=false;setOpen(false);setQuery("")};
  const choose=(slug:string)=>{close();router.push(`/skill/${slug}`)};
  const onKeyDown=(event:React.KeyboardEvent<HTMLInputElement>)=>{if(event.key==="Escape"){event.preventDefault();close()}else if(event.key==="ArrowDown"){event.preventDefault();setActive(index=>Math.min(results.length-1,index+1))}else if(event.key==="ArrowUp"){event.preventDefault();setActive(index=>Math.max(0,index-1))}else if(event.key==="Enter"&&results[active]){event.preventDefault();choose(results[active].detailSlug)}};

  return <>
    <button className={compact?"catalog-link command-trigger":"search-box command-trigger"} onClick={show} aria-haspopup="dialog" aria-expanded={open}>
      <SearchIcon/><span>Find a skill</span><kbd>⌘ K</kbd>
    </button>
    {open&&createPortal(<div className="command-backdrop" role="presentation" onPointerDown={(event)=>{if(event.target===event.currentTarget)close()}}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Find a skill">
        <label className="command-input"><SearchIcon/><input ref={inputRef} value={query} onChange={event=>{setQuery(event.target.value);setActive(0)}} onKeyDown={onKeyDown} placeholder="Search skills, owners, categories…" aria-label="Search skills"/><kbd>Esc</kbd></label>
        <div className="command-results" role="listbox" aria-label="Skills">{results.length?results.map((skill,index)=><button key={skill.id} className={index===active?"active":""} style={{"--category":skill.color} as React.CSSProperties} role="option" aria-selected={index===active} onMouseEnter={()=>setActive(index)} onClick={()=>choose(skill.detailSlug)}><span className="command-category"><i/>{categoryById[skill.category].label}</span><strong>{skill.name}</strong><small>{skill.owner}</small><em>↗</em></button>):<p className="command-empty">No skills match “{query}”.</p>}</div>
        <footer className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>Esc</kbd> Close</span></footer>
      </section>
    </div>,document.body)}
  </>;
}
