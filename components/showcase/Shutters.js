"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionValueEvent, useScroll } from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";
import { holdProgress, holdScroll, scrollToProgress } from "./hold";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

const SLATS = 10;
const STAGGER = 0.09; // how far behind its neighbour each slat starts turning
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (x) => x * x * (3 - 2 * x);
const pad = (i) => String(i + 1).padStart(2, "0");

// one slice of a capture, sized so the slices line up into the whole image
const face = (s) => ({
  backgroundSize: `${SLATS * 100}% 100%`,
  backgroundPosition: `${(s / (SLATS - 1)) * 100}% 0%`,
  backgroundRepeat: "no-repeat",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
});

/*
  Facility: the window is a set of vertical slats, like the louvres on a
  tower's facade. Between modules the slats turn over one after another,
  each carrying a slice of the current screen on its front and the next on
  its back, and alternate direction on every step. At rest the slats step
  aside for the full-resolution capture, so every module reads pin-sharp.
  The floor list beside it shows where you are and jumps to any module.
*/
export default function Shutters({ project }) {
  const ref = useRef(null);
  const slats = useRef([]);
  const segRef = useRef(-1);
  const reduce = useReduced();
  const near = useNear(ref);
  const screens = project.screens;
  const n = screens.length;
  const [rest, setRest] = useState(0); // the capture shown while nothing turns
  const [turning, setTurning] = useState(false);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // the slats paint from the original files, so have them ready before a turn
  useEffect(() => {
    if (!near) return;
    screens.forEach((s) => {
      const img = new window.Image();
      img.src = s.src;
    });
  }, [near, screens]);

  const paint = useCallback(
    (p) => {
      const k = holdProgress(p, n);
      const seg = Math.min(n - 2, Math.floor(k));
      const t = clamp(k - seg, 0, 1);
      const back = seg % 2 === 1; // every other step turns right to left

      if (seg !== segRef.current) {
        segRef.current = seg;
        slats.current.forEach((sl) => {
          if (!sl) return;
          sl.front.style.backgroundImage = `url("${screens[seg].src}")`;
          sl.back.style.backgroundImage = `url("${screens[seg + 1].src}")`;
        });
      }

      const total = 1 + STAGGER * (SLATS - 1);
      slats.current.forEach((sl, s) => {
        if (!sl) return;
        const order = back ? SLATS - 1 - s : s;
        const a = smooth(clamp(t * total - order * STAGGER, 0, 1));
        sl.el.style.transform = `perspective(1100px) rotateY(${(back ? -a : a) * 180}deg)`;
        const shade = (Math.sin(a * Math.PI) * 0.55).toFixed(3);
        sl.frontShade.style.opacity = shade;
        sl.backShade.style.opacity = shade;
      });

      if (t <= 0) setRest(seg);
      else if (t >= 1) setRest(seg + 1);
      setTurning(t > 0 && t < 1);
      setIndex(Math.min(n - 1, Math.round(k)));
    },
    [n, screens]
  );

  useMotionValueEvent(scrollYProgress, "change", paint);
  useEffect(() => {
    paint(scrollYProgress.get());
  }, [paint, reduce, scrollYProgress]);

  const go = (i) => scrollToProgress(ref.current, holdScroll(i, n), reduce);
  const step = screens[index];
  const shown = reduce ? index : rest;

  return (
    <section
      id={project.slug}
      data-pin=""
      aria-labelledby={`${project.slug}-title`}
      className="relative"
      {...fieldProps({ shape: project.shape, accent: project.accent, anchor: "back", alpha: 0.35, alphaEnd: 0.14 })}
    >
      <div ref={ref} style={{ height: `${n * 55 + 100}vh` }}>
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          <div className="wrap grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pb-6 pt-20 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,0.8fr)] lg:grid-rows-1 lg:items-center lg:gap-14 lg:pb-0 lg:pt-14">
            {/* right on wide screens: what it is, and the floors */}
            <div className="lg:order-2">
              <ProjectHeader project={project} size="md" />
              <p className="mt-5 hidden max-w-[40ch] text-[15px] leading-relaxed text-muted lg:block">{project.summary}</p>
              <ol className="mt-6 hidden gap-0.5 lg:grid">
                {screens.map((s, i) => {
                  const on = i === index;
                  return (
                    <li key={s.src}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-current={on ? "step" : undefined}
                        className={`flex w-full items-center gap-4 rounded-[10px] px-3 py-[7px] text-left transition-colors duration-200 ${
                          on ? "bg-ink/[0.07] text-ink" : "text-muted hover:text-ink"
                        }`}
                      >
                        <span className={`font-mono text-[12px] ${on ? "text-accent" : "text-muted/60"}`}>{pad(i)}</span>
                        <span className="text-[15px]">{s.label}</span>
                        <span
                          aria-hidden="true"
                          className={`ml-auto h-1.5 w-1.5 rounded-full bg-accent transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0"}`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
              <p aria-live="polite" className="mt-5 hidden min-h-[2.8rem] max-w-[40ch] text-[15px] leading-snug text-muted lg:block">
                {step.line}
              </p>
            </div>

            {/* the window: light captures in a light frame. The cell stretches to
                the full row so the size container has a height to measure. */}
            <div className="flex min-h-0 items-center justify-center [container-type:size] lg:order-1 lg:justify-start lg:self-stretch">
              <div className="browser browser--light w-[min(100%,calc((100cqh-2.25rem)*1.6))] lg:w-[min(100%,calc((min(100cqh,70dvh)-2.25rem)*1.6))]">
                <div className="browser-bar shrink-0">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                  </span>
                  <span className="truncate font-mono text-[12px] text-muted">
                    facility <span className="opacity-60">/ {step.label.toLowerCase()}</span>
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-muted">
                    {pad(index)} / {pad(n - 1)}
                  </span>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#e9ebee]">
                  {!reduce && (
                    <div className="absolute inset-0 flex" aria-hidden="true">
                      {Array.from({ length: SLATS }).map((_, s) => (
                        <div
                          key={s}
                          ref={(el) => {
                            if (el) {
                              slats.current[s] = {
                                el,
                                front: el.children[0],
                                back: el.children[1],
                                frontShade: el.children[0].firstChild,
                                backShade: el.children[1].firstChild,
                              };
                            }
                          }}
                          className="relative h-full flex-1 [transform-style:preserve-3d]"
                          style={{ willChange: "transform" }}
                        >
                          <div className="absolute inset-0" style={face(s)}>
                            <span className="absolute inset-0 bg-black opacity-0" />
                          </div>
                          <div className="absolute inset-0" style={{ ...face(s), transform: "rotateY(180deg)" }}>
                            <span className="absolute inset-0 bg-black opacity-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* at rest: the capture itself, the same file the slats use */}
                  <div className={`absolute inset-0 ${turning && !reduce ? "invisible" : ""}`}>
                    {screens.map((s, i) => (
                      <div
                        key={s.src}
                        className={`absolute inset-0 ${reduce ? "transition-opacity duration-300" : ""}`}
                        style={{ opacity: i === shown ? 1 : 0 }}
                        aria-hidden={i !== shown}
                      >
                        <Image
                          src={s.src}
                          alt={`${project.name}: ${s.label}`}
                          fill
                          unoptimized
                          loading={near ? "eager" : "lazy"}
                          fetchPriority="low"
                          draggable={false}
                          className="object-cover object-top"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* phones and tablets: progress and caption under the window */}
            <div className="lg:hidden">
              <div className="mb-2 flex gap-1.5">
                {screens.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show ${s.label}`}
                    className="flex-1 py-2"
                  >
                    <span className={`block h-[3px] rounded-full transition-colors duration-200 ${i <= index ? "bg-accent" : "bg-ink/15"}`} />
                  </button>
                ))}
              </div>
              <p aria-live="polite" className="min-h-[3.4rem] text-[15px] leading-snug">
                <span className="font-medium">{step.label}. </span>
                <span className="text-muted">{step.line}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProjectDetails project={project} />
    </section>
  );
}
