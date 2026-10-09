"use client";

import { useEffect, useState } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";

/*
  Reduced-motion flag that is false on the server and on the first client
  render, so hydration always matches. It flips after mount.
*/
export function useReduced() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!reduce : false;
}

// Motion skips transform animations for people who ask for reduced motion.
export function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
