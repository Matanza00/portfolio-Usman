"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

const pad = (i) => String(i + 1).padStart(2, "0");

// One phone in the row: it tips in, stands level at the centre, tips out.
// Input ranges stay inside 0..1: Motion drives these from a scroll timeline,
// which rejects offsets outside it.
function Phone({ shot, p, at, near, project, i }) {
  const wide = [Math.max(0, at - 0.3), at, Math.min(1, at + 0.3)];
  const tight = [Math.max(0, at - 0.13), at, Math.min(1, at + 0.13)];
  const rotate = useTransform(p, wide, [7, 0, -7]);
  const y = useTransform(p, wide, [44, 0, 44]);
  const scale = useTransform(p, wide, [0.93, 1, 0.93]);
  const lineOpacity = useTransform(p, tight, [0, 1, 0]);
  return (
    <motion.li style={{ rotate, y, scale }} className="w-[min(60vw,236px)] shrink-0">
      <div className="aspect-[1170/2532] rounded-[2rem] bg-[#15171c] p-[6px] shadow-[0_50px_100px_-40px_rgb(0_0_0/0.95)] ring-1 ring-white/[0.14]">
        <div className="relative h-full w-full overflow-hidden rounded-[1.65rem] bg-white">
          <Image
            src={shot.src}
            alt={`${project.name} app: ${shot.label}`}
            fill
            sizes="(min-width: 640px) 236px, 60vw"
            quality={90}
            loading={near ? "eager" : "lazy"}
            fetchPriority="low"
            draggable={false}
            className="object-cover object-top"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[1.35%] h-[3.5%] w-[31%] -translate-x-1/2 rounded-full bg-black"
          />
        </div>
      </div>
      <p className="label mt-5">
        <span className="text-accent">{pad(i)}</span>
        <span className="mx-2 text-ink/25" aria-hidden="true">
          /
        </span>
        {shot.label}
      </p>
      <motion.p style={{ opacity: lineOpacity }} className="mt-2 min-h-[2.6rem] text-[14px] leading-snug text-muted">
        {shot.line}
      </motion.p>
    </motion.li>
  );
}

/*
  iFund: the whole flow laid side by side. A row of phones slides across the
  screen as the page scrolls, one screen per step from launch to billing,
  and each phone stands up straight as it reaches the centre.
*/
export default function PhoneDeck({ project }) {
  const ref = useRef(null);
  const track = useRef(null);
  const drag = useRef(null);
  const reduce = useReduced();
  const near = useNear(ref);
  const screens = project.screens;
  const n = screens.length;
  const [travel, setTravel] = useState(0);
  const [index, setIndex] = useState(0);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

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
  useMotionValueEvent(p, "change", (v) => {
    const next = Math.min(n - 1, Math.max(0, Math.round(((v - 0.04) / 0.88) * n - 1)));
    if (next !== index) setIndex(next);
  });

  // sideways touch drags become the equivalent vertical scroll
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse") return;
    drag.current = { x: e.clientX, y: e.clientY, last: e.clientX, active: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || !ref.current || travel <= 0) return;
    if (!d.active) {
      const dx = Math.abs(e.clientX - d.x);
      if (dx < 10 || dx < Math.abs(e.clientY - d.y)) return;
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
          <ul className="mt-10 flex gap-6 overflow-x-auto pb-4">
            {screens.map((shot, i) => (
              <li key={shot.src} className="w-[220px] shrink-0">
                <div className="relative aspect-[1170/2532] overflow-hidden rounded-[1.6rem] bg-[#15171c] p-[5px] ring-1 ring-white/[0.14]">
                  <Image
                    src={shot.src}
                    alt={`${project.name} app: ${shot.label}`}
                    fill
                    sizes="220px"
                    className="rounded-[1.3rem] object-cover object-top"
                  />
                </div>
                <p className="label mt-4">
                  {pad(i)} / {shot.label}
                </p>
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
      <div ref={ref} className="h-[360vh]">
        <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden pb-8 pt-20 sm:pt-24">
          <div className="wrap flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <ProjectHeader project={project} size="md" />
            <p className="label shrink-0 sm:text-right" aria-live="polite">
              <span className="text-accent">{pad(index)}</span>
              <span className="mx-2 text-ink/25" aria-hidden="true">
                /
              </span>
              {pad(n - 1)}
              <span className="ml-3 hidden text-ink sm:inline">{screens[index].label}</span>
            </p>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center">
            {/* the flow line the phones travel along */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-ink/10" />
            <motion.ul
              ref={track}
              style={{ x }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="relative flex w-max touch-pan-y items-center gap-7 pl-[var(--gx)] pr-[var(--gx)] sm:gap-10 xl:pl-[max(var(--gx),calc((100vw-1240px)/2+var(--gx)))]"
            >
              <li className="flex w-[min(78vw,360px)] shrink-0 flex-col justify-center self-center">
                <p className="text-[clamp(1.15rem,1.8vw,1.45rem)] leading-snug tracking-[-0.015em] text-ink/90">
                  {project.summary}
                </p>
                <p className="label mt-6">Scroll to move along the flow</p>
              </li>
              {screens.map((shot, i) => (
                <Phone
                  key={shot.src}
                  i={i}
                  shot={shot}
                  p={p}
                  near={near}
                  project={project}
                  at={0.04 + ((i + 1) / n) * 0.88}
                />
              ))}
            </motion.ul>
          </div>
        </div>
      </div>

      <ProjectDetails project={project} />
    </section>
  );
}
