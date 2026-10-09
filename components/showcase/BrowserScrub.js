"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

/*
  Web apps: a pinned browser window. Scrolling steps through real captures of
  the app, one screen per step, while a progress rail fills on the left. The
  screens are plain images in the DOM, so they stay pixel-sharp. Same scrub
  mechanic as the phone showcase, in a landscape browser frame.
*/
export default function BrowserScrub({ project }) {
  const ref = useRef(null);
  const reduce = useReduced();
  const near = useNear(ref);
  const screens = project.screens;
  const n = screens.length;
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    if (next !== index) setIndex(next);
  });

  const rise = useTransform(enter, [0, 1], [130, 0]);
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const step = screens[index];

  return (
    <section
      id={project.slug}
      data-pin=""
      aria-labelledby={`${project.slug}-title`}
      className="relative"
      {...fieldProps({ shape: project.shape, accent: project.accent, anchor: "far-right", alpha: 0.55 })}
    >
      <div ref={ref} style={{ height: `${n * 50 + 100}vh` }}>
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          <div className="wrap grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pb-6 pt-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.5fr)] lg:grid-rows-1 lg:items-center lg:gap-14 lg:pb-0 lg:pt-14">
            {/* left: what you're looking at */}
            <div>
              {/* long names (Fleet Management System) would run into the window at the large size */}
              <ProjectHeader project={project} size={project.name.length > 14 ? "md" : "lg"} />
              <p className="mt-5 hidden max-w-[42ch] text-[16px] leading-relaxed text-muted lg:block">
                {project.summary}
              </p>

              <ol className="relative mt-7 hidden lg:block">
                <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-ink/10" />
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent"
                  style={{ scaleY: fill }}
                />
                {screens.map((s, i) => (
                  <li
                    key={s.src}
                    aria-current={i === index ? "step" : undefined}
                    className={`py-[5px] pl-5 text-[15px] transition-colors duration-200 ease-snap ${
                      i === index ? "font-medium text-ink" : "text-muted"
                    }`}
                  >
                    {s.label}
                  </li>
                ))}
              </ol>
              <p aria-live="polite" className="mt-6 hidden min-h-[2.8rem] max-w-[40ch] text-[15px] leading-snug lg:block">
                <motion.span
                  key={index}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: [0, 0, 0.2, 1] }}
                  className="inline-block text-muted"
                >
                  {step.line}
                </motion.span>
              </p>
            </div>

            {/* right: the app in a browser */}
            <div className="flex min-h-0 items-center justify-center lg:justify-end">
              {/* the capture area is exactly 16:10, like the captures, so nothing is cropped */}
              <motion.div
                style={reduce ? undefined : { y: rise }}
                className="browser w-full max-w-[min(92vw,calc((100dvh-8rem)*1.6))] lg:w-[min(100%,calc((68dvh-2.25rem)*1.6))] lg:max-w-none"
              >
                <div className="browser-bar shrink-0">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                  </span>
                  <span className="truncate font-mono text-[12px] text-muted">
                    {project.domain ?? project.name.toLowerCase()}
                  </span>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden bg-white">
                  <motion.div
                    className="h-full"
                    initial={false}
                    animate={{ y: `-${index * 100}%` }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 20 }}
                  >
                    {screens.map((s, i) => (
                      <div key={s.src} className="relative h-full w-full" aria-hidden={i !== index}>
                        <Image
                          src={s.src}
                          alt={`${project.name}: ${s.label}`}
                          fill
                          sizes="(min-width: 1024px) 60vw, 92vw"
                          quality={90}
                          loading={near ? "eager" : "lazy"}
                          fetchPriority="low"
                          className="object-cover object-top"
                        />
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* phones and tablets: progress and caption under the window */}
            <div className="lg:hidden">
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
