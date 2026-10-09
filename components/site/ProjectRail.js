"use client";

import { useEffect, useState } from "react";
import { PROJECTS } from "@/lib/projects";
import { scrollToId } from "@/components/motion/SmoothScroll";

// Side index for the work section: shows which project you're in and lets
// you jump between them. Wide screens only; the palette covers the rest.
export default function ProjectRail() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const els = PROJECTS.map((p) => document.getElementById(p.slug)).filter(Boolean);
    const inView = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inView.add(e.target.id) : inView.delete(e.target.id)));
        const first = PROJECTS.find((p) => inView.has(p.slug));
        setActive(first ? first.slug : null);
      },
      // a section is "current" while it crosses the middle of the screen
      { rootMargin: "-50% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Projects"
      className={`fixed right-5 top-1/2 z-rail hidden -translate-y-1/2 transition-opacity duration-300 xl:block ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ul className="space-y-3.5">
        {PROJECTS.map((p) => {
          const on = p.slug === active;
          return (
            <li key={p.slug}>
              <a
                href={`#${p.slug}`}
                aria-current={on ? "true" : undefined}
                tabIndex={active ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(p.slug);
                }}
                className="group flex min-h-6 items-center justify-end gap-3"
              >
                <span
                  className="rounded-full bg-bg/90 px-2 py-1 font-mono text-[12px] uppercase tracking-[0.12em] text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ color: on ? p.accent : undefined }}
                >
                  {p.name}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-px w-8 origin-right transition-transform duration-200 ease-snap ${on ? "scale-x-100" : "scale-x-50 bg-ink/30 group-hover:scale-x-75"}`}
                  style={on ? { background: p.accent } : undefined}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
