"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

function supportsWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

// Loads three.js after first paint. Skipped entirely for reduced motion or
// when WebGL2 is missing; the page is complete without it.
export default function Field() {
  const [config, setConfig] = useState(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !supportsWebGL2()) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
    const id = idle(() =>
      setConfig(coarse ? { count: 7000, maxDpr: 1.5 } : { count: 18000, maxDpr: 2 })
    );
    return () => (window.cancelIdleCallback ?? clearTimeout)(id);
  }, []);

  // stop rendering while the tab is hidden
  useEffect(() => {
    const onVis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!config) return null;
  return <ParticleField {...config} active={active} />;
}
