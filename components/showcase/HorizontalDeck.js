"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// A screen in the deck: it tips in, sits level at the centre, tips out.
function Card({ p, shot, at, near }) {
  const rotate = useTransform(p, [at - 0.3, at, at + 0.3], [7, 0, -7]);
  const y = useTransform(p, [at - 0.3, at, at + 0.3], [44, 0, 44]);
  return (
    <motion.li style={{ rotate, y }} className="shrink-0">
      <Image
        src={shot.src}
        alt={`SafaLife ${shot.label} screen`}
        width={shot.w}
        height={shot.h}
        sizes="(min-width: 640px) 420px, 70vw"
        quality={90}
        loading={near ? "eager" : "lazy"}
        fetchPriority="low"
        draggable={false}
        className="h-[min(54dvh,540px)] w-auto select-none rounded-[18px] ring-1 ring-white/10"
      />
      <p className="label mt-4 flex items-center justify-between">
        <span>{shot.label}</span>
        <span className="text-accent">+{shot.points}</span>
      </p>
    </motion.li>
  );
}

/*
  SafaLife: a gamified habit app, so its showcase keeps score. The store
  screens slide sideways as the page scrolls, and every screen adds to a
  points counter and a seven-day streak. This is the one section that bounces.
*/
export default function HorizontalDeck({ project }) {
  const ref = useRef(null);
  const track = useRef(null);
  const counter = useRef(null);
  const drag = useRef(null);
  const reduce = useReduced();
  const near = useNear(ref);
  const deck = project.deck;
  const total = deck.reduce((sum, d) => sum + d.points, 0);
  const [travel, setTravel] = useState(0);
  const [streak, setStreak] = useState(0);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // how far the track has to move to show its last card
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  const x = useTransform(p, [0.04, 0.96], [0, -travel]);
  const points = useSpring(useTransform(p, [0.08, 0.96], [0, total]), { stiffness: 600, damping: 15 });

  useMotionValueEvent(points, "change", (v) => {
    if (counter.current) counter.current.textContent = String(Math.max(0, Math.round(v)));
  });
  useMotionValueEvent(p, "change", (v) => {
    const next = Math.min(7, Math.max(0, Math.floor(v * 8)));
    if (next !== streak) setStreak(next);
  });

  // The deck moves sideways, so people try to swipe it sideways. A horizontal
  // touch drag is turned into the equivalent vertical scroll (vertical drags
  // are left to the browser).
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse") return;
    drag.current = { x: e.clientX, y: e.clientY, last: e.clientX, active: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || !ref.current || travel <= 0) return;
    if (!d.active) {
      const dx = Math.abs(e.clientX - d.x);
      if (dx < 10 || dx < Math.abs(e.clientY - d.y)) return; // threshold, and sideways intent
      d.active = true;
    }
    const range = ref.current.offsetHeight - window.innerHeight;
    window.scrollBy(0, (-(e.clientX - d.last) * 0.92 * range) / travel);
    d.last = e.clientX;
  };
  const endDrag = () => {
    drag.current = null;
  };

  const field = fieldProps({ shape: project.shape, accent: project.accent, anchor: "top", alpha: 0.95 });

  if (reduce) {
    return (
      <section id={project.slug} aria-labelledby={`${project.slug}-title`} className="relative" {...field}>
        <div className="wrap py-24">
          <ProjectHeader project={project} />
          <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted">{project.summary}</p>
          <ul className="mt-10 flex gap-5 overflow-x-auto pb-4">
            {deck.map((shot) => (
              <li key={shot.src} className="shrink-0">
                <Image
                  src={shot.src}
                  alt={`SafaLife ${shot.label} screen`}
                  width={shot.w}
                  height={shot.h}
                  sizes="300px"
                  className="h-[420px] w-auto rounded-[18px] ring-1 ring-white/10"
                />
              </li>
            ))}
          </ul>
        </div>
        <ProjectDetails project={project} />
      </section>
    );
  }

  return (
    <section id={project.slug} data-pin="" aria-labelledby={`${project.slug}-title`} className="relative" {...field}>
      <div ref={ref} className="h-[340vh]">
        <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden pb-8 pt-20 sm:pt-24">
          <div className="wrap flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <ProjectHeader project={project} size="md" />

            {/* the score: points earned so far, and the streak */}
            <div className="flex shrink-0 items-center gap-5 sm:block sm:text-right" aria-hidden="true">
              <p className="font-mono text-[clamp(1.6rem,3.4vw,2.6rem)] font-medium leading-none tabular-nums tracking-[-0.04em]">
                <span ref={counter}>0</span>
                <span className="ml-1.5 text-[0.45em] uppercase tracking-[0.12em] text-muted">pts</span>
              </p>
              <ul className="flex gap-1.5 sm:mt-3 sm:justify-end">
                {DAYS.map((d, i) => (
                  <motion.li
                    key={i}
                    initial={false}
                    animate={{ scale: i < streak ? 1 : 0.86 }}
                    transition={{ type: "spring", stiffness: 600, damping: 15 }}
                    className={`grid h-6 w-6 place-items-center rounded-full font-mono text-[10px] transition-colors duration-200 ${
                      i < streak ? "bg-accent text-bg" : "bg-ink/[0.07] text-muted"
                    }`}
                  >
                    {d}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center">
            <motion.ul
              ref={track}
              style={{ x }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="flex w-max touch-pan-y items-start gap-6 pl-[var(--gx)] pr-[var(--gx)] sm:gap-9 xl:pl-[max(var(--gx),calc((100vw-1240px)/2+var(--gx)))]"
            >
              <li className="flex h-[min(54dvh,540px)] w-[min(78vw,380px)] shrink-0 flex-col justify-center">
                <Image
                  src="/images/app-icon.png"
                  alt="SafaLife app icon"
                  width={56}
                  height={56}
                  className="mb-6 rounded-[14px]"
                />
                <p className="text-[clamp(1.15rem,1.8vw,1.45rem)] leading-snug tracking-[-0.015em] text-ink/90">
                  {project.summary}
                </p>
                <p className="label mt-6">Scroll to earn the streak</p>
              </li>
              {deck.map((shot, i) => (
                <Card key={shot.src} p={p} shot={shot} near={near} at={0.04 + ((i + 1) / deck.length) * 0.88} />
              ))}
            </motion.ul>
          </div>
        </div>
      </div>

      <ProjectDetails project={project} />
    </section>
  );
}
