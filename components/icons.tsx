import type { SVGProps } from "react";

export function SearchIcon(props: SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>; }
export function ArrowIcon(props: SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path d="M5 12h14M14 6l6 6-6 6"/></svg>; }
export function SunIcon(props: SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>; }
export function NodeIcon({ kind }: { kind: string }) { return <svg viewBox="0 0 24 24" aria-hidden="true">{kind === "human" ? <><path d="M5 20V4m0 1h11l-2 4 2 4H5"/></> : kind === "artifact" ? <><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/></> : kind === "loop" ? <><path d="M18 7a8 8 0 1 0 1 8"/><path d="m18 3 .5 5-5-.5"/></> : <><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="m8 12 8-5M8 12l8 5"/></>}</svg>; }
