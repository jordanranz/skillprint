"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchIcon, SunIcon } from "./icons";

export function Header({ search, onSearch }: { search?: string; onSearch?: (value: string) => void }) {
  const [theme, setTheme] = useState("dark");
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); document.querySelector<HTMLInputElement>("#skill-search")?.focus();
      }
    };
    document.addEventListener("keydown", listener); return () => document.removeEventListener("keydown", listener);
  }, []);
  return <header className="topbar"><div className="shell topbar-inner">
    <Link className="brand" href="/"><span className="brand-mark">S</span><span>Skillprint</span></Link>
    <span className="beta">MVP</span>
    {onSearch ? <label className="search-box"><SearchIcon/><input id="skill-search" value={search} onChange={(e)=>onSearch(e.target.value)} placeholder="Find a skill"/><kbd>⌘ K</kbd></label> : <span className="topbar-spacer"/>}
    <button className="icon-button" onClick={()=>setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle color theme"><SunIcon/></button>
  </div></header>;
}
