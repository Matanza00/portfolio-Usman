"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// One page in the pile. Behind the front page it peeks out above, smaller and
// fainter; when its turn is over it lifts, tilts and slides off the bottom of
// the pile (the pile clips it), fading only at the very end.
function Page({ i, k, n, screen, project, near }) {
  const d = useTransform(k, (v) => i - v);
  const y = useTransform(d, (v) => (v >= 0 ? `${-clamp(v, 0, 3) * 5.5}%` : `${clamp(-v, 0, 1) * 118}%`));
  const scale = useTransform(d, (v) => (v >= 0 ? 1 - clamp(v, 0, 3) * 0.055 : 1 + clamp(-v, 0, 1) * 0.03));
  const rotate = useTransform(d, (v) => (v >= 0 ? 0 : clamp(-v, 0, 1) * 4));
  const opacity = useTransform(d, (v) => (v >= 0 ? clamp(1 - v * 0.26, 0.1, 1) : clamp(1 - (-v - 0.75) * 4, 0, 1)));
  return (
    <motion.li
      style={{ y, scale, rotate, opacity, zIndex: n - i, transformOrigin: "50% 100%" }}
      className="browser absolute inset-0 flex flex-col"
    >
      <div className="browser-bar shrink-0">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        </span>
        <span className="truncate font-mono text-[12px] text-muted">
          {project.domain}
          <span className="text-muted/50">/{screen.label.toLowerCase().replace(/\s+/g, "-")}</span>
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden bg-white">
        <Image
          src={screen.src}
          alt={`${project.name}: ${screen.label}`}
          fill
          sizes="(min-width: 1024px) 70vw, 92vw"
          quality={90}
          loading={near ? "eager" : "lazy"}
          fetchPriority="low"
          draggable={false}
          className="object-cover object-top"
        />
      </div>
    </motion.li>
  );
}

/*
  Subyect: the site as a pile of pages. The pages sit stacked, each one
  peeking out above the last; as you scroll the front page lifts, tilts and
  falls away, and the next one comes forward to take its place.
*/
export default function StackPeel({ project }) {
  const ref = useRef(null);
  const reduce = useReduced();
  const near = useNear(ref);
  const screens = project.screens;
  const n = screens.length;
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const k = useTransform(scrollYProgress, [0.08, 0.92], [0, n - 1]);
  useMotionValueEvent(k, "change", (v) => {
    const next = clamp(Math.round(v), 0, n - 1);
    if (next !== index) setIndex(next);
  });

  const step = screens[index];

  return (
    <section
      id={project.slug}
      data-pin=""
      aria-labelledby={`${project.slug}-title`}
      className="relative"
      {...fieldProps({ shape: project.shape, accent: project.accent, anchor: "back", alpha: 0.3, alphaEnd: 0.12 })}
    >
      <div ref={ref} style={{ height: reduce ? "auto" : `${n * 55 + 100}vh` }}>
        <div className={reduce ? "wrap py-24" : "sticky top-0 h-[100dvh] overflow-hidden"}>
          <div className={reduce ? "" : "wrap grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pb-6 pt-20 sm:pt-24"}>
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
              // a size container: the pile (plus the room above it where the
              // pages behind peek out) never grows taller than the row, and the
              // clipping box is what a leaving page slides out of
              <div className="flex min-h-0 items-end justify-center [container-type:size]">
                <div className="w-[min(100%,130cqh)] overflow-hidden pt-[14%]">
                  <ul className="relative aspect-[16/10] w-full [perspective:1400px]">
                    {screens.map((s, i) => (
                      <Page key={s.src} i={i} k={k} n={n} screen={s} project={project} near={near} />
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!reduce && (
              <div>
                <div className="mb-3 flex gap-1.5" aria-hidden="true">
                  {screens.map((s, i) => (
                    <span
                      key={s.src}
                      className={`h-[3px] flex-1 rounded-full transition-colors duration-200 ${
                        i <= index ? "bg-accent" : "bg-ink/15"
                      }`}
                    />
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
