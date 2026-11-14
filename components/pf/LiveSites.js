"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { LIVE_FILTERS } from "@/lib/live";
import { Reveal, Settle, Words } from "./Motion";

const STATUS = { live: "Live", review: "In client review", concept: "Concept" };

// Move across the screenshot to scrub down the real page; tap to step on touch.
function Scrub({ site }) {
  const [on, setOn] = useState(0);
  const k = site.frames.length;
  const pick = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setOn(Math.min(k - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * k))));
  };
  return (
    <button
      type="button"
      className="pf-scrub"
      onPointerMove={pick}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOn(0)}
      onClick={() => setOn((i) => (i + 1) % k)}
      aria-label={`Show the next part of the ${site.name} page (${on + 1} of ${k})`}
    >
      {site.frames.map((src, i) => (
        <img key={src} src={src} alt="" width={1200} height={750} loading="lazy" decoding="async" data-on={i === on} />
      ))}
      <span className="pf-ticks" aria-hidden="true">
        {site.frames.map((src, i) => (
          <b key={src} data-on={i === on} />
        ))}
      </span>
    </button>
  );
}

function SiteCard({ site }) {
  return (
    <article className="min-w-0" style={{ "--site": site.accent }}>
      <Settle>
      <div className="pf-browser">
        <div className="pf-browser-bar" aria-hidden="true">
          <i /><i /><i />
          <span>{site.domain}</span>
        </div>
        <Scrub site={site} />
      </div>
      </Settle>
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[22px] font-semibold tracking-[-0.015em]">{site.name}</h3>
        <span className="pf-status" data-kind={site.status}>
          {STATUS[site.status]}, {site.year}
        </span>
      </div>
      <p className="pf-small mt-2 max-w-[56ch] text-[15px]">{site.line}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Built with">
        {site.stack.map((t) => (
          <li key={t} className="pf-tag">{t}</li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <a className="pf-btn pf-btn--ink pf-btn--sm" href={site.url} target="_blank" rel="noopener">
          {site.visitLabel || "Visit site"}
          <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
        </a>
        {site.caseHref && (
          <Link className="pf-btn pf-btn--line pf-btn--sm" href={site.caseHref}>
            Read the case study
          </Link>
        )}
      </div>
    </article>
  );
}

export default function LiveSites({ sites }) {
  const [filter, setFilter] = useState("all");
  // the filter lives in the URL (?sites=3d) so a filtered view can be shared
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("sites");
    if (LIVE_FILTERS.some(([k]) => k === f)) setFilter(f);
    // the voice assistant filters the list with this event
    const on = (e) => LIVE_FILTERS.some(([k]) => k === e.detail) && choose(e.detail);
    window.addEventListener("pf:filter", on);
    return () => window.removeEventListener("pf:filter", on);
  }, []);
  const choose = (key) => {
    setFilter(key);
    const u = new URL(window.location.href);
    if (key === "all") u.searchParams.delete("sites");
    else u.searchParams.set("sites", key);
    window.history.replaceState(null, "", u);
  };
  const shown = useMemo(() => (filter === "all" ? sites : sites.filter((s) => s.tags.includes(filter))), [filter, sites]);
  return (
    <section id="live" aria-labelledby="live-title" className="scroll-mt-20 py-24 sm:py-32">
      <div className="pf-wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Words as="h2" id="live-title" className="pf-h2" text="Live on the web" />
            <Reveal as="p" delay={0.15} className="pf-lead mt-4">
              Every site here is running right now. Move across a screenshot to scrub down the page, or open the real thing.
            </Reveal>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter sites">
            {LIVE_FILTERS.map(([key, label]) => {
              const count = key === "all" ? sites.length : sites.filter((s) => s.tags.includes(key)).length;
              return (
                <button key={key} type="button" className="pf-chip" aria-pressed={filter === key} onClick={() => choose(key)}>
                  {label} <small>{count}</small>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-16 md:grid-cols-2">
          {shown.map((s) => (
            <SiteCard key={s.slug} site={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
