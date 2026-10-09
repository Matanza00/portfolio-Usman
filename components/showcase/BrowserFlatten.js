"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import AutoSlides from "./AutoSlides";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

/*
  Atomic Muscles: a browser window that arrives tilted back in 3D, lays flat
  as you scroll, then grows until the site fills the screen, crossfading
  through real captures of the pages. Its phone layout slides in last.
*/
export default function BrowserFlatten({ project }) {
  const ref = useRef(null);
  const reduce = useReduced();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const rotateX = useTransform(p, [0, 0.42], [28, 0]);
  const scale = useTransform(p, [0, 0.42, 0.78], [0.66, 0.86, 1]);
  const y = useTransform(p, [0, 0.42, 0.78], ["21%", "9%", "0%"]);
  const headOpacity = useTransform(p, [0.3, 0.5], [1, 0]);
  const headY = useTransform(p, [0.3, 0.5], [0, -28]);
  const phoneX = useTransform(p, [0.8, 0.96], ["70%", "0%"]);
  const phoneOpacity = useTransform(p, [0.8, 0.9], [0, 1]);

  return (
    <section
      id={project.slug}
      data-pin=""
      aria-labelledby={`${project.slug}-title`}
      className="relative"
      {...fieldProps({ shape: project.shape, accent: project.accent, anchor: "top-right", narrow: "mid", alpha: 0.6, alphaEnd: 0.04 })}
    >
      <div ref={ref} className={reduce ? "" : "h-[290vh]"}>
        <div className={reduce ? "wrap py-24" : "sticky top-0 h-[100dvh] overflow-hidden"}>
          <motion.div
            style={reduce ? undefined : { opacity: headOpacity, y: headY }}
            className={reduce ? "mb-10" : "wrap absolute inset-x-0 top-20 sm:top-24"}
          >
            <ProjectHeader project={project} />
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted">
              {project.summary}
            </p>
          </motion.div>

          <div
            className={
              reduce
                ? ""
                : "absolute inset-0 grid place-items-center pt-14 [perspective:1500px]"
            }
          >
            <motion.div
              style={reduce ? undefined : { rotateX, scale, y, transformOrigin: "50% 100%" }}
              className={`relative ${reduce ? "w-full" : "w-[min(92vw,calc((100dvh-7.5rem)*1.6))]"}`}
            >
              <div className="browser">
                <div className="browser-bar">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                  </span>
                  <span className="truncate font-mono text-[12px] text-muted">{project.domain}</span>
                </div>
                <AutoSlides screens={project.screens} label={`${project.name} site, page by page`} />
              </div>

              {/* the same site on a phone */}
              <motion.div
                style={reduce ? undefined : { x: phoneX, opacity: phoneOpacity }}
                className="relative mx-auto mt-5 w-[36%] rounded-[1.1rem] bg-[#15171c] p-[4px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/[0.14] sm:absolute sm:bottom-[4%] sm:right-[2.5%] sm:mt-0 sm:w-[13%]"
              >
                <Image
                  src={project.mobile}
                  alt={`${project.name} on a phone`}
                  width={390}
                  height={844}
                  sizes="170px"
                  quality={90}
                  className="block h-auto w-full rounded-[0.85rem]"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <ProjectDetails project={project} />
    </section>
  );
}
