"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReduced } from "@/components/motion/useReduced";

// Real captures of a site, crossfading one into the next while on screen.
// Reduced motion shows the first capture and stops.
export default function AutoSlides({ screens, label, interval = 2600 }) {
  const ref = useRef(null);
  const reduce = useReduced();
  const [i, setI] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!on || reduce || screens.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % screens.length), interval);
    return () => clearInterval(id);
  }, [on, reduce, screens.length, interval]);

  return (
    <div ref={ref} className="relative aspect-[16/10] w-full overflow-hidden bg-black" role="img" aria-label={label}>
      {screens.map((s, k) => (
        <div
          key={s.src}
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: k === i ? 1 : 0 }}
          aria-hidden={k !== i}
        >
          <Image
            src={s.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 80vw, 92vw"
            quality={88}
            loading={k === 0 ? "eager" : "lazy"}
            className="object-cover object-top"
          />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
        <div className="flex gap-1.5" aria-hidden="true">
          {screens.map((s, k) => (
            <span
              key={s.src}
              className={`h-1 rounded-full transition-all duration-300 ${k === i ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
        <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[11px] text-white/90">{screens[i].label}</span>
      </div>
    </div>
  );
}
