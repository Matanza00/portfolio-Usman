"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/*
  A thread down the left edge of the page. As you scroll, it fills from the
  top, a bead slides down it, and each section's mark lights up when the bead
  reaches it, with the section's name riding beside the bead. Click a mark to
  jump to that section.
*/
export default function ScrollThread({ sections }) {
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const top = useTransform(p, (v) => `${(v * 100).toFixed(2)}%`);
  const [marks, setMarks] = useState([]);
  const [at, setAt] = useState(0);

  // where each section sits along the page, as a fraction of the scroll
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setMarks(
        sections
          .map(({ id, label }) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35;
            return { id, label, at: Math.min(1, Math.max(0, y / max)) };
          })
          .filter(Boolean),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [sections]);

  useMotionValueEvent(scrollYProgress, "change", (v) => setAt(v));
  const current = [...marks].reverse().find((m) => at >= m.at - 0.005);

  return (
    <nav className="pf-thread" aria-label="Page sections">
      <span className="pf-thread-track" aria-hidden="true" />
      <motion.span className="pf-thread-fill" style={{ scaleY: still ? scrollYProgress : p }} aria-hidden="true" />
      {marks.map((m) => (
        <a
          key={m.id}
          href={`#${m.id}`}
          className="pf-thread-mark"
          data-on={at >= m.at - 0.005}
          style={{ top: `${m.at * 100}%` }}
          aria-label={m.label}
          aria-current={current?.id === m.id ? "true" : undefined}
        />
      ))}
      <motion.span className="pf-thread-bead" style={{ top: still ? undefined : top }} aria-hidden="true">
        {current && (
          <motion.span
            key={current.id}
            className="pf-thread-label"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            {current.label}
          </motion.span>
        )}
      </motion.span>
    </nav>
  );
}
