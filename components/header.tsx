"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SunIcon } from "./icons";
import { CommandPalette } from "./command-palette";

export function Header() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return <header className="topbar"><div className="shell topbar-inner">
    <Link className="brand" href="/"><span className="brand-mark">S</span><span>Skillprint</span></Link>
    <span className="beta">MVP</span>
    <CommandPalette/>
    <button className="icon-button" onClick={()=>setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle color theme"><SunIcon/></button>
  </div></header>;
}
