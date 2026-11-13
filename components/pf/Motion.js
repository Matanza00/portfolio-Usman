"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/*
  The page's motion kit. Everything here runs on Motion in JavaScript, so it
  works in every browser (CSS scroll timelines only run in Chromium). With
  reduced motion on, things still fade in but nothing moves.
*/

const VIEW = { once: true, margin: "0px 0px -10% 0px" };
const spring = { type: "spring", stiffness: 80, damping: 18, mass: 0.9 };

// Fades and rises into place the first time it scrolls into view.
export function Reveal({ as = "div", delay = 0, y = 34, className, children, ...rest }) {
  const M = motion[as];
  return (
    <M
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ ...spring, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

// A headline whose words rise out of a mask, one after another.
export function Words({ text, as = "h2", className, id, delay = 0, stagger = 0.06 }) {
  const M = motion[as];
  const words = text.split(" ");
  return (
    <M
      id={id}
      className={className}
      initial="hide"
      whileInView="show"
      viewport={VIEW}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="pf-word" aria-hidden="true">
          <motion.span
            className="pf-word-in"
            data-reveal=""
            variants={{ hide: { y: "108%", rotate: 4, opacity: 0 }, show: { y: "0%", rotate: 0, opacity: 1 } }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </M>
  );
}

/*
  Scroll-linked: tips back and sits low while it is near the bottom of the
  screen, and settles flat as you scroll it up into place.
*/
export function Settle({ children, className = "", tilt = 16 }) {
  const ref = useRef(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.55"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [tilt, 0]);
  const y = useTransform(p, [0, 1], [90, 0]);
  const scale = useTransform(p, [0, 1], [0.9, 1]);
  const opacity = useTransform(p, [0, 0.6], [0.25, 1]);
  return (
    <div ref={ref} className={className} style={{ perspective: 1400 }}>
      <motion.div style={still ? { opacity } : { rotateX, y, scale, opacity, transformOrigin: "50% 100%" }}>{children}</motion.div>
    </div>
  );
}

// Scroll-linked: drifts up, tips away and fades as you scroll past it.
export function ScrollAway({ children, className = "" }) {
  const ref = useRef(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.25", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);
  return (
    <div ref={ref} className={className} style={{ perspective: 1400 }}>
      <motion.div style={still ? undefined : { y, rotateX, scale, opacity }}>{children}</motion.div>
    </div>
  );
}

// Counts up to a figure like "580+" or "5 yrs" when it comes into view.
export function CountUp({ value, className, style }) {
  const ref = useRef(null);
  const seen = useInView(ref, VIEW);
  const still = useReducedMotion();
  const m = String(value).match(/^(\D*)(\d+)(.*)$/);
  // the real figure until it scrolls into view, so the HTML and search engines see it
  const [n, setN] = useState(m ? +m[2] : 0);
  useEffect(() => {
    if (!m || !seen) return;
    const to = +m[2];
    if (still) return setN(to);
    const c = animate(0, to, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, still]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <span className={className} style={style}>{value}</span>;
  return (
    <span ref={ref} className={className} style={style} aria-label={value}>
      <span aria-hidden="true">
        {m[1]}
        {n}
        {m[3]}
      </span>
    </span>
  );
}

// A thin line under the header that fills as you scroll down the page.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.span className="pf-progress" style={{ scaleX }} aria-hidden="true" />;
}
