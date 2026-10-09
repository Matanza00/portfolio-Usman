"use client";

import { useEffect, useRef } from "react";

// A "+" glyph that follows the pointer, matching the accent plus in the
// wordmark, with a soft blurred pool of light trailing just behind it. Only
// on fine pointers (mouse); the native cursor is hidden by the .cursor-plus-on
// class (see globals.css), kept in text fields and the palette.
export default function CursorPlus() {
  const ref = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    const glow = glowRef.current;
    if (!el || !glow) return;
    const root = document.documentElement;
    root.classList.add("cursor-plus-on");

    let tx = -100,
      ty = -100,
      x = -100,
      y = -100,
      gx = -100,
      gy = -100,
      raf = 0;

    const overNative = (t) => !!(t && t.closest && t.closest('input, textarea, [contenteditable="true"], dialog'));

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      const shown = overNative(e.target) ? "0" : "1";
      el.style.opacity = shown;
      glow.style.opacity = shown;
    };
    const onLeave = () => {
      el.style.opacity = "0";
      glow.style.opacity = "0";
    };
    const tick = () => {
      x += (tx - x) * 0.5;
      y += (ty - y) * 0.5;
      gx += (tx - gx) * 0.2;
      gy += (ty - gy) * 0.2;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      glow.style.transform = `translate3d(${gx.toFixed(2)}px, ${gy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove("cursor-plus-on");
    };
  }, []);

  return (
    <>
      <span ref={glowRef} aria-hidden="true" className="cursor-glow" />
      <span ref={ref} aria-hidden="true" className="cursor-plus">
        +
      </span>
    </>
  );
}
