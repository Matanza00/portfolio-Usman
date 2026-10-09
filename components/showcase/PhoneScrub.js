"use client";

import { useRef, useState } from "react";
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

/*
  iFund: a pinned phone. Scrolling steps through real captures of the app,
  one flow step per screen, while the phone slowly turns. The screens are
  plain images in the DOM, so they stay pixel-sharp.
*/
export default function PhoneScrub({ project }) {
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

  // held, not thrown: a slow camera-like turn
  const turn = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [-18, 0, 14]), {
    stiffness: 120,
    damping: 30,
    mass: 1.2,
  });
  const rise = useTransform(enter, [0, 1], [160, 0]);
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
          <div className="wrap grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pb-6 pt-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-1 lg:items-center lg:gap-12 lg:pb-0 lg:pt-14">
            {/* left: what you're looking at */}
            <div>
              <ProjectHeader project={project} />
              <p className="mt-5 hidden max-w-[40ch] text-[16px] leading-relaxed text-muted lg:block">
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
              <p aria-live="polite" className="mt-6 hidden min-h-[2.8rem] max-w-[38ch] text-[15px] leading-snug lg:block">
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

            {/* centre: the app */}
            <div className="flex min-h-0 items-center justify-center [perspective:1400px]">
              <motion.div
                style={reduce ? undefined : { rotateY: turn, y: rise }}
                className="relative aspect-[1170/2532] h-full max-h-[640px] rounded-[2.6rem] bg-[#15171c] p-[7px] shadow-[0_60px_120px_-40px_rgb(0_0_0/0.95)] ring-1 ring-white/[0.14] lg:h-[min(74dvh,640px)]"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[2.15rem] bg-white">
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
                          alt={`${project.name} app: ${s.label}`}
                          fill
                          sizes="(min-width: 1024px) 290px, 60vw"
                          quality={90}
                          // clipped screens are invisible to native lazy loading
                          loading={near ? "eager" : "lazy"}
                          fetchPriority="low"
                          className="object-cover object-top"
                        />
                      </div>
                    ))}
                  </motion.div>

                  {/* Dynamic Island: screenshots never include it */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-[1.35%] h-[3.5%] w-[31%] -translate-x-1/2 rounded-full bg-black"
                  />
                </div>
              </motion.div>
            </div>

            {/* phones and tablets: progress and caption under the device */}
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
