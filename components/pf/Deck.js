"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { useReduced } from "@/components/motion/useReduced";

/*
  The hero: a hand of live sites. Drag or flick the front card away (or use the
  arrows) and the next site comes up. Cards behind fan out a little, so it reads
  as a stack you can work through.
*/
const SHOWN = 4;
const spring = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };
const pose = (depth, small) => ({
  x: depth * (small ? 14 : 30),
  y: depth * (small ? -12 : -20),
  rotate: [0, 4, -3, 6.5][depth] ?? 7,
  scale: 1 - depth * 0.05,
  opacity: depth < SHOWN ? 1 : 0,
});

export default function Deck({ sites }) {
  const reduce = useReduced();
  const [top, setTop] = useState(0);
  const [dealt, setDealt] = useState(false);
  const [flung, setFlung] = useState(null); // the card on its way out, and which way
  const [small, setSmall] = useState(false);
  const n = sites.length;
  const site = sites[top];

  useEffect(() => {
    const t = setTimeout(() => setDealt(true), 60);
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => { clearTimeout(t); mq.removeEventListener("change", on); };
  }, []);

  const go = useCallback(
    (dir) => {
      setFlung({ i: top, dir });
      setTop((t) => (t + (dir > 0 ? 1 : n - 1)) % n);
    },
    [top, n],
  );

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };

  return (
    <div className="relative" onKeyDown={onKey}>
      <div className="pf-deck" role="group" aria-roledescription="carousel" aria-label="Live websites">
        {sites.map((s, i) => {
          const depth = (i - top + n) % n;
          if (depth >= SHOWN && flung?.i !== i) return null;
          const out = flung?.i === i;
          const target = out
            ? { x: flung.dir * 520, y: -30, rotate: flung.dir * 18, scale: 0.96, opacity: 0 }
            : pose(depth, small);
          // on load the cards drop in from the top, one after another
          const initial = reduce ? false : { x: 0, y: -520, rotate: -10 + depth * 5, scale: 0.92, opacity: 0 };
          return (
            <motion.div
              key={s.slug}
              className="pf-deck-card"
              style={{ zIndex: out ? 50 : SHOWN - depth, "--site": s.accent }}
              initial={initial}
              animate={dealt || reduce ? target : initial}
              transition={out ? { duration: 0.4, ease: [0.4, 0, 1, 1] } : { ...spring, delay: dealt && !flung ? (SHOWN - depth) * 0.07 : 0 }}
              onAnimationComplete={() => out && setFlung(null)}
              drag={depth === 0 && !out ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) go(info.offset.x < 0 ? 1 : -1);
              }}
              onTap={() => depth === 0 && go(1)}
              aria-hidden={depth !== 0}
            >
              <div className="pf-browser h-full">
                <div className="pf-browser-bar" aria-hidden="true">
                  <i /><i /><i />
                  <span>{s.domain}</span>
                </div>
                <img
                  src={s.frames[0]}
                  alt={depth === 0 ? `${s.name}, the live site's first screen` : ""}
                  width={1200}
                  height={750}
                  draggable={false}
                  loading={depth < 2 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  className="block h-[calc(100%-34px)] w-full object-cover object-top"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-2 flex items-start gap-4 sm:mt-0">
        <div className="min-w-0 flex-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={site.slug}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-[19px] font-semibold tracking-[-0.01em]">{site.name}</p>
              <p className="pf-small mt-1 max-w-[44ch]">{site.line}</p>
              <a className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold underline decoration-[1.5px] underline-offset-4" href={site.url} target="_blank" rel="noopener">
                {site.visitLabel || `Visit ${site.domain}`}
                <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="pf-small mr-1 tabular-nums" aria-hidden="true">
            {top + 1}/{n}
          </span>
          <button type="button" className="pf-icon-btn" onClick={() => go(-1)} aria-label="Previous site">
            <ArrowLeft size={18} weight="bold" />
          </button>
          <button type="button" className="pf-icon-btn" onClick={() => go(1)} aria-label="Next site">
            <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
