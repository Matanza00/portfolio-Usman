"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import { fieldProps } from "@/lib/field";
import { EMAIL } from "@/lib/site";
import { LAND } from "@/components/motion/Reveal";
import { useReduced } from "@/components/motion/useReduced";
import { scrollToId } from "@/components/motion/SmoothScroll";

const HEADLINE = [
  { text: "I build the app," },
  { text: "the API and" },
  { text: "everything between.", accent: true },
];

// Kalispell's clock (Mountain time), so remote clients can see my local time.
function LocalTime() {
  const [time, setTime] = useState(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Denver",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time ? `${time} local time` : "Mountain time"}</span>;
}

export default function Hero() {
  const reduce = useReduced();
  let word = 0;

  const enter = (delay) => ({
    "data-reveal": "",
    initial: reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
    transition: { duration: 0.5, delay, ease: LAND },
  });

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100dvh] flex-col"
      {...fieldProps({ shape: "stack", anchor: "right", narrow: "top", alpha: 0.9 })}
    >
      <div className="wrap flex flex-1 items-end pb-10 pt-[36dvh] lg:items-center lg:pt-28">
        <div className="max-w-[46rem]" data-field-clear="">
          <motion.p {...enter(0)} className="label">
            Usman Nadeem
            <span className="mx-2 text-ink/25" aria-hidden="true">
              /
            </span>
            Senior Full Stack Developer
          </motion.p>

          <h1
            id="hero-title"
            aria-label={HEADLINE.map((l) => l.text).join(" ")}
            className="mt-6 text-[clamp(2.7rem,6.6vw,6.1rem)] font-semibold leading-[0.96] tracking-[-0.05em]"
          >
            {HEADLINE.map((line) => (
              <span key={line.text} aria-hidden="true" className={`block ${line.accent ? "text-accent" : ""}`}>
                {line.text.split(" ").map((w) => {
                  const i = word++;
                  return (
                    <motion.span
                      key={i}
                      data-reveal=""
                      className="inline-block whitespace-pre"
                      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(12px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                      transition={{ duration: 0.55, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {w}{" "}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </h1>

          <motion.p {...enter(0.75)} className="mt-8 max-w-[52ch] text-[17px] leading-relaxed text-muted sm:text-lg">
            I ship scalable SaaS end to end: React and Next.js front ends, Node,
            Express and NestJS APIs, SQL or NoSQL behind them, deployed with
            Docker and CI/CD on AWS.
          </motion.p>

          <motion.div {...enter(0.85)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("work");
              }}
              className="btn btn-primary"
            >
              See the work
              <ArrowDown size={16} weight="bold" aria-hidden="true" />
            </a>
            <a href={`mailto:${EMAIL}`} className="btn btn-ghost">
              Say hello
            </a>
          </motion.div>
        </div>
      </div>

      <div className="wrap">
      <motion.dl {...enter(1)} className="grid gap-x-10 border-t border-ink/10 sm:grid-cols-3">
        {[
          ["Now", "Software Architect, Legit Design Studio"],
          ["Based", null],
          ["Open to", "Full-time roles and freelance, remote"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-4 border-b border-ink/10 py-4 sm:border-b-0">
            <dt className="label w-16 shrink-0">{k}</dt>
            <dd className="text-[15px] text-ink/85">
              {v ?? (
                <>
                  Kalispell, Montana <span className="text-muted">/</span> <LocalTime />
                </>
              )}
            </dd>
          </div>
        ))}
      </motion.dl>
      </div>
    </section>
  );
}
