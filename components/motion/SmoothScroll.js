"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";

// Inertia scrolling on desktop only. Lenis is driven from Motion's frame loop,
// so scroll position and scroll-linked transforms update in the same frame.
// Touch devices and reduced motion keep native scrolling.
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    const update = ({ timestamp }) => lenis.raf(timestamp);
    frame.update(update, true);
    window.__lenis = lenis;

    return () => {
      cancelFrame(update);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

// Scroll to a section. Pinned showcases (data-pin) start exactly at their top;
// normal sections leave room for the fixed header.
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = el.hasAttribute("data-pin") ? 0 : -72;
  // shareable URL, and focus follows the jump (without a second scroll)
  window.history.replaceState(null, "", id === "top" ? window.location.pathname : "#" + id);
  el.setAttribute("tabindex", "-1");
  el.setAttribute("data-jump", "");
  el.focus({ preventScroll: true });
  const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY + offset);
  if (window.__lenis) {
    window.__lenis.scrollTo(y, { duration: 1.3 });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
}
