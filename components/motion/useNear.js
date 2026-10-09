"use client";

import { useEffect, useState } from "react";

// True once the element is within about half a screen of the viewport, and stays true.
// Used to hold back media that the browser's own lazy loading can't see
// (clipped screens inside the phone, off-screen deck cards, video posters).
export function useNear(ref, rootMargin = "60% 0px") {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, near, rootMargin]);

  return near;
}
