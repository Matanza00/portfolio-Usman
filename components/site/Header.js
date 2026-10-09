"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { List, MagnifyingGlass } from "@phosphor-icons/react";
import { PROJECTS } from "@/lib/projects";
import { EMAIL } from "@/lib/site";
import { scrollToId } from "@/components/motion/SmoothScroll";
import { openPalette } from "./CommandPalette";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "path", label: "Path" },
  { id: "contact", label: "Contact" },
];

// every place the page can be "at", in order; projects count as Work in the nav
const PLACES = ["top", "work", ...PROJECTS.map((p) => p.slug), "about", "skills", "path", "contact"];
const navFor = (place) => (PROJECTS.some((p) => p.slug === place) ? "work" : place);

export default function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [place, setPlace] = useState("top");

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 16;
    if (next !== scrolled) setScrolled(next);
  });

  // Track which section is under the middle of the screen. It drives the
  // active nav item and keeps the URL shareable (#amariya, #contact, ...).
  useEffect(() => {
    const els = PLACES.map((id) => document.getElementById(id)).filter(Boolean);
    const inView = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inView.add(e.target.id) : inView.delete(e.target.id)));
        const current = [...PLACES].reverse().find((id) => inView.has(id));
        if (!current) return;
        setPlace(current);
        const hash = current === "top" ? "" : `#${current}`;
        if (window.location.hash !== hash) {
          window.history.replaceState(null, "", hash || window.location.pathname + window.location.search);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };

  const active = navFor(place);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-nav border-b transition-[background-color,border-color] duration-200 ease-snap ${
        scrolled ? "border-ink/10 bg-bg/95" : "border-transparent"
      }`}
    >
      <div className="wrap flex h-14 items-center justify-between gap-4">
        <a
          href="#top"
          onClick={go("top")}
          className="-ml-2 flex h-11 items-center gap-2 px-2 text-[15px] font-semibold tracking-[-0.02em]"
        >
          <span className="font-mono text-accent" aria-hidden="true">
            +
          </span>
          Usman Nadeem
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const on = active === l.id;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={go(l.id)}
                aria-current={on ? "true" : undefined}
                className={`relative flex h-11 items-center px-3 text-sm transition-colors duration-150 ${
                  on ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
                {on && (
                  <motion.span
                    layoutId="nav-mark"
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-[9px] h-px bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPalette}
            className="hidden h-9 items-center gap-2.5 rounded-[10px] border border-ink/10 pl-3 pr-2 text-sm text-muted transition-colors duration-150 hover:border-ink/25 hover:text-ink md:inline-flex"
          >
            <MagnifyingGlass size={15} aria-hidden="true" />
            Search
            <span className="flex gap-1" aria-hidden="true">
              <kbd className="kbd">Ctrl</kbd>
              <kbd className="kbd">K</kbd>
            </span>
          </button>
          <a href={`mailto:${EMAIL}`} className="btn btn-primary btn-sm">
            Say hello
          </a>
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-[10px] border border-ink/10 text-ink md:hidden"
          >
            <List size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* how far down the page you are; it's a long scroll */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className={`absolute inset-x-0 -bottom-px h-px origin-left bg-ink/60 transition-opacity duration-200 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
}
