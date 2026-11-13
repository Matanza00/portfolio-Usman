"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Microphone, PaintBucket } from "@phosphor-icons/react";
import { startVoice } from "@/lib/voice";
import { useVoice } from "./VoiceDock";

const BACKDROPS = {
  navy: { src: "/me/navy.webp", label: "navy" },
  gray: { src: "/me/gray.webp", label: "grey" },
};

/*
  My photo, three ways to play with it:
  - it leans toward the pointer and catches a little light;
  - a tap or click repaints the backdrop, navy to grey and back, in a circle
    that grows from where you touched;
  - while the voice assistant talks, a ring around it moves with the voice.
  Scrolling past it, the photo drifts inside its frame and the frame settles.
*/
export default function Portrait() {
  const still = useReducedMotion();
  const box = useRef(null);
  const [bg, setBg] = useState("navy");
  const [wipe, setWipe] = useState(null);
  const voice = useVoice();
  const live = voice.status === "connecting" || voice.status === "live";

  // lean toward the pointer
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sry = useSpring(ry, { stiffness: 160, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(30);
  const glare = useTransform([gx, gy], ([x, y]) => `radial-gradient(60% 50% at ${x}% ${y}%, rgb(255 255 255 / 0.28), transparent 70%)`);

  // scroll: the frame settles and the photo drifts inside it
  const { scrollYProgress } = useScroll({ target: box, offset: ["start end", "end start"] });
  const settle = useTransform(scrollYProgress, [0, 0.35], [-5, 0]);
  const drift = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const move = (e) => {
    if (still || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set((0.5 - py) * 10);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
  };

  const repaint = (x = 50, y = 45) => {
    if (wipe) return;
    const to = bg === "navy" ? "gray" : "navy";
    if (still) return setBg(to);
    setWipe({ to, x, y, key: Date.now() });
  };
  const tap = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    repaint(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };

  return (
    <div ref={box} className="pf-portrait-wrap">
      <motion.div className="pf-portrait-ring" data-live={live} aria-hidden="true" />
      <motion.div
        className="pf-portrait"
        style={still ? undefined : { rotateX: srx, rotateY: sry, rotate: settle }}
        onPointerMove={move}
        onPointerLeave={leave}
        onClick={tap}
      >
        <motion.div className="absolute inset-[-6%]" style={still ? undefined : { y: drift }}>
          {/* both photos stay loaded; the one on top is clipped to a circle that grows from your tap */}
          {Object.entries(BACKDROPS).map(([key, b]) => {
            const front = wipe ? key === wipe.to : key === bg;
            return (
              <motion.div
                key={key}
                className="absolute inset-0"
                style={{ zIndex: wipe && front ? 2 : front ? 1 : 0 }}
                initial={false}
                animate={{
                  clipPath:
                    wipe && front
                      ? [`circle(0% at ${wipe.x}% ${wipe.y}%)`, `circle(150% at ${wipe.x}% ${wipe.y}%)`]
                      : "circle(150% at 50% 50%)",
                }}
                transition={wipe && front ? { duration: 0.75, ease: [0.65, 0, 0.35, 1] } : { duration: 0 }}
                onAnimationComplete={() => {
                  if (wipe && front) {
                    setBg(wipe.to);
                    setWipe(null);
                  }
                }}
              >
                <Image
                  src={b.src}
                  alt={key === bg ? "Usman Nadeem, smiling, in a dark suit and white shirt" : ""}
                  aria-hidden={key === bg ? undefined : true}
                  fill
                  loading="eager"
                  sizes="(min-width: 1024px) 460px, 90vw"
                  className="object-cover object-[50%_30%]"
                  draggable={false}
                />
              </motion.div>
            );
          })}
        </motion.div>
        {!still && <motion.div className="pf-portrait-glare" style={{ background: glare }} aria-hidden="true" />}
      </motion.div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button type="button" className="pf-btn pf-btn--ink" onClick={startVoice} disabled={live}>
          <Microphone size={17} weight="bold" aria-hidden="true" />
          {live ? "Assistant is on" : "Talk to my AI assistant"}
        </button>
        <button type="button" className="pf-btn pf-btn--line" onClick={() => repaint()}>
          <PaintBucket size={17} weight="bold" aria-hidden="true" />
          Repaint the wall
        </button>
      </div>
      <p className="pf-small mt-3">Tap the photo to repaint the wall, {bg === "navy" ? "now navy" : "now grey"}.</p>
    </div>
  );
}
