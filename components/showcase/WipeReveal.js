"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";
import { holdProgress, holdScroll, scrollToProgress } from "./hold";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const frac = (v) => v - Math.floor(v);

// One capture. It is uncovered from the left as the divider sweeps across,
// drifting the last few percent into place, and dims as the next one covers it.
function Layer({ i, k, n, screen, project, near }) {
  const reveal = useTransform(k, (v) => clamp(v - (i - 1), 0, 1));
  const clip = useTransform(reveal, (r) => `inset(0 ${((1 - r) * 100).toFixed(3)}% 0 0)`);
  const x = useTransform(reveal, (r) => `${(-(1 - r) * 5).toFixed(3)}%`);
  const shade = useTransform(k, (v) => clamp(v - i, 0, 1) * 0.45);
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={i === 0 ? undefined : { clipPath: clip, WebkitClipPath: clip }}
    >
      <motion.div className="absolute inset-0" style={i === 0 ? undefined : { x }}>
        <Image
          src={screen.src}
          alt={`${project.name}: ${screen.label}`}
          fill
          sizes="(min-width: 1024px) 80vw, 96vw"
          quality={90}
          loading={near ? "eager" : "lazy"}
          fetchPriority="low"
          draggable={false}
          className="object-cover object-top"
        />
      </motion.div>
      {i < n - 1 && (
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
      )}
    </motion.div>
  );
}

/*
  ZestLead: one browser window, and every scroll step wipes the next screen
  across the last one, behind a lit divider with a handle, like a
  before-and-after slider. Each screen holds still before the next wipe, and
  the progress marks below jump straight to a screen.
*/
export default function WipeReveal({ project }) {
  const ref = useRef(null);
  const reduce = useReduced();
  const near = useNear(ref);
  const screens = project.screens;
  const n = screens.length;
  const [seg, setSeg] = useState(0);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const k = useTransform(scrollYProgress, (p) => holdProgress(p, n));

  useMotionValueEvent(k, "change", (v) => {
    const s = Math.min(n - 2, Math.floor(v));
    if (s !== seg) setSeg(s);
    const i = Math.min(n - 1, Math.round(v));
    if (i !== index) setIndex(i);
  });

  // the divider sits on the moving edge, and only while a wipe is under way
  const edge = useTransform(k, (v) => `${(frac(v) * 100).toFixed(3)}%`);
  const edgeOn = useTransform(k, (v) => {
    const f = frac(v);
    return f > 0.004 && f < 0.996 ? 1 : 0;
  });

  const go = (i) => scrollToProgress(ref.current, holdScroll(i, n), reduce);
  const step = screens[index];
  const label = project.domain ?? project.name.toLowerCase();

  return (
    <section
      id={project.slug}
      data-pin=""
      aria-labelledby={`${project.slug}-title`}
      className="relative"
      {...fieldProps({ shape: project.shape, accent: project.accent, anchor: "back", alpha: 0.28, alphaEnd: 0.1 })}
    >
      <div ref={ref} style={{ height: reduce ? "auto" : `${n * 60 + 100}vh` }}>
        <div className={reduce ? "wrap py-24" : "sticky top-0 h-[100dvh] overflow-hidden"}>
          <div className={reduce ? "" : "wrap grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pb-6 pt-20 sm:gap-5 sm:pt-24"}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <ProjectHeader project={project} />
              <p className="hidden max-w-[42ch] text-[15px] leading-relaxed text-muted md:block">{project.summary}</p>
            </div>

            {reduce ? (
              <ul className="mt-10 grid gap-6 sm:grid-cols-2">
                {screens.map((s) => (
                  <li key={s.src} className="browser">
                    <div className="relative aspect-[16/10]">
                      <Image src={s.src} alt={`${project.name}: ${s.label}`} fill sizes="50vw" className="object-cover object-top" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              // a size container, so the window is never taller than its row
              <div className="flex min-h-0 items-center justify-center [container-type:size]">
                <div className="browser w-[min(100%,calc((100cqh-2.25rem)*1.6))]">
                  <div className="browser-bar">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    </span>
                    <span className="truncate font-mono text-[12px] text-muted">
                      {label} <span className="text-muted/50">/ {step.label.toLowerCase()}</span>
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-white">
                    {screens.map((s, i) => (
                      <Layer key={s.src} i={i} k={k} n={n} screen={s} project={project} near={near} />
                    ))}

                    {/* the divider: a lit edge with a handle, and which screen is on each side */}
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 z-10 w-0"
                      style={{ left: edge, opacity: edgeOn }}
                    >
                      <span className="absolute inset-y-0 -left-px w-[2px] bg-accent shadow-[0_0_28px_4px_rgb(var(--accent)/0.55)]" />
                      <span className="absolute left-0 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent font-mono text-[15px] font-semibold text-[#06201d] shadow-[0_10px_30px_-6px_rgb(0_0_0/0.6)]">
                        ‹›
                      </span>
                      <span className="absolute right-full top-4 mr-3 hidden whitespace-nowrap rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] text-white sm:block">
                        {screens[seg + 1]?.label}
                      </span>
                      <span className="absolute left-full top-4 ml-3 hidden whitespace-nowrap rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] text-white/80 sm:block">
                        {screens[seg].label}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}

            {!reduce && (
              <div>
                <div className="mb-2 flex gap-1.5">
                  {screens.map((s, i) => (
                    <button
                      key={s.src}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Show ${s.label}`}
                      aria-current={i === index ? "step" : undefined}
                      className="group flex-1 py-2"
                    >
                      <span
                        className={`block h-[3px] rounded-full transition-colors duration-200 ${
                          i <= index ? "bg-accent" : "bg-ink/15 group-hover:bg-ink/35"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p aria-live="polite" className="min-h-[2.6rem] max-w-[64ch] text-[15px] leading-snug">
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
                    className="inline-block"
                  >
                    <span className="font-medium">{step.label}. </span>
                    <span className="text-muted">{step.line}</span>
                  </motion.span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProjectDetails project={project} />
    </section>
  );
}
