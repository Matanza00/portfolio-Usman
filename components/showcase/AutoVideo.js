"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";

// Muted walkthrough that plays only while on screen. Always has a pause control.
export default function AutoVideo({ src, poster, label, className }) {
  const ref = useRef(null);
  const userPaused = useRef(false);
  const reduce = useReduced();
  const near = useNear(ref);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce) v.pause();
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduce && !userPaused.current) {
          v.play().catch(() => {});
        } else if (!e.isIntersecting) {
          v.pause();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <video
        ref={ref}
        className="block aspect-[16/10] w-full bg-black object-cover"
        poster={near ? poster : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className="absolute bottom-3 left-3 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/25 transition-transform duration-150 ease-snap hover:scale-105 active:scale-95"
      >
        {playing ? <Pause size={16} weight="fill" aria-hidden="true" /> : <Play size={16} weight="fill" aria-hidden="true" />}
      </button>
    </div>
  );
}
