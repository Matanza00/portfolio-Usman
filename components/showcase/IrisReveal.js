"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import AutoVideo from "./AutoVideo";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

const LINE = "Press the orb and speak. She walks you through the page.";

// One spoken word: sharpens and rises as the scroll reaches it.
function Word({ p, at, children }) {
  const opacity = useTransform(p, [at, at + 0.035], [0.24, 1]);
  const y = useTransform(p, [at, at + 0.035], [16, 0]);
  const blur = useTransform(p, [at, at + 0.035], [8, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span style={{ opacity, y, filter }} className="inline-block whitespace-pre">
      {children}{" "}
    </motion.span>
  );
}

// A voice-level bar. Its height follows the scroll, so it moves when you do.
function Bar({ p, i }) {
  const scaleY = useTransform(p, (v) => 0.22 + 0.78 * Math.abs(Math.sin(v * 46 + i * 1.9)));
  return <motion.span style={{ scaleY }} className="h-12 w-[3px] rounded-full bg-accent" />;
}

/*
  Amariya: a voice-led site, so it opens like a voice. The page starts inside
  a small orb, a line of transcript appears word by word, then the orb irises
  open into the full recording.
*/
export default function IrisReveal({ project }) {
  const ref = useRef(null);
  const reduce = useReduced();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // inset() with a huge radius reads as a circle; it relaxes into the frame
  const tb = useTransform(p, [0.3, 0.72], [33, 0]);
  const lr = useTransform(p, [0.3, 0.72], [39.4, 0]);
  const radius = useTransform(p, [0.3, 0.72], [420, 14]);
  const clipPath = useMotionTemplate`inset(${tb}% ${lr}% round ${radius}px)`;

  const scrim = useTransform(p, [0.3, 0.46], [1, 0]);
  const ringOpacity = useTransform(p, [0.26, 0.4], [1, 0]);
  const ringScale = useTransform(p, [0.26, 0.5], [1, 1.5]);
  const textOpacity = useTransform(p, [0.28, 0.42], [1, 0]);
  const textY = useTransform(p, [0.28, 0.42], [0, -24]);
  const phoneOpacity = useTransform(p, [0.74, 0.88], [0, 1]);
  const phoneY = useTransform(p, [0.74, 0.88], [24, 0]);

  const words = LINE.split(" ");

  return (
    <section
      id={project.slug}
      data-pin=""
      aria-labelledby={`${project.slug}-title`}
      className="relative"
      {...fieldProps({ shape: project.shape, accent: project.accent, anchor: "center", narrow: "center", alpha: 0.8, alphaEnd: 0.06, offsetY: 28 })}
    >
      <div ref={ref} className={reduce ? "" : "h-[300vh]"}>
        <div className={reduce ? "wrap py-24" : "sticky top-0 h-[100dvh] overflow-hidden"}>
          <motion.div
            style={reduce ? undefined : { opacity: textOpacity, y: textY }}
            className={reduce ? "mb-10" : "wrap absolute inset-x-0 top-20 sm:top-24"}
          >
            <ProjectHeader project={project} />
            <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-muted">
              {project.summary}
            </p>
          </motion.div>

          <div className={reduce ? "" : "absolute inset-0 grid place-items-center pt-14"}>
            <div className={`relative ${reduce ? "w-full" : "w-[min(92vw,calc((100dvh-7.5rem)*1.6))]"}`}>
              <motion.div
                style={reduce ? undefined : { clipPath }}
                className="iris-clip relative overflow-hidden rounded-[14px] border border-ink/10"
              >
                <AutoVideo src={project.video} poster={project.poster} label={`${project.name} walkthrough`} />
                {/* while it is still an orb, show a voice level instead of a cropped page */}
                {!reduce && (
                  <motion.div
                    aria-hidden="true"
                    style={{ opacity: scrim }}
                    className="iris-scrim pointer-events-none absolute inset-0 grid place-items-center bg-[#14110f]"
                  >
                    <span className="flex items-center gap-[6px]">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Bar key={i} p={p} i={i} />
                      ))}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* a landscape recording is small on a phone, so phones also get the phone capture */}
              {!reduce && (
                <motion.div
                  style={{ opacity: phoneOpacity, y: phoneY }}
                  className="absolute left-[34%] top-[calc(100%+18px)] w-[32%] rounded-[1rem] bg-[#15171c] p-[3px] ring-1 ring-white/[0.14] sm:hidden"
                >
                  <Image
                    src={project.mobile}
                    alt={`${project.name} on a phone`}
                    width={390}
                    height={844}
                    sizes="130px"
                    quality={90}
                    className="block h-auto w-full rounded-[0.8rem]"
                  />
                </motion.div>
              )}

              {!reduce && (
                <motion.div
                  aria-hidden="true"
                  style={{ opacity: ringOpacity }}
                  className="pointer-events-none absolute inset-0"
                >
                  {/* x/y here, not CSS translate: Motion owns the transform */}
                  <motion.span
                    style={{ scale: ringScale, x: "-50%", y: "-50%" }}
                    className="absolute left-1/2 top-1/2 aspect-square h-[40%] rounded-full border border-accent/60"
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* the transcript line, under the orb */}
          <motion.p
            aria-label={LINE}
            style={reduce ? undefined : { opacity: textOpacity }}
            className={
              reduce
                ? "mt-8 text-xl font-medium tracking-[-0.02em]"
                : "wrap absolute inset-x-0 bottom-[9dvh] text-center text-[clamp(1.25rem,2.6vw,2.1rem)] font-medium leading-tight tracking-[-0.03em]"
            }
          >
            {reduce
              ? LINE
              : words.map((w, i) => (
                  <Word key={i} p={p} at={0.03 + (i / words.length) * 0.2}>
                    <span aria-hidden="true">{w}</span>
                  </Word>
                ))}
          </motion.p>
        </div>
      </div>

      <ProjectDetails project={project} />
    </section>
  );
}
