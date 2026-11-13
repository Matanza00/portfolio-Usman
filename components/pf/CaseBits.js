"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { BrowserFrame, Frame, PhoneFrame } from "./Frames";
import { isPhone, labelOf } from "@/lib/shots";

const spring = { type: "spring", stiffness: 140, damping: 20, mass: 0.9 };

/* The hero devices rise into the stage once, when the page opens. */
export function HeroDevices({ hero, domain, name }) {
  const still = useReducedMotion();
  const rise = (delay, extra = {}) =>
    still
      ? { initial: false, animate: extra }
      : { initial: { y: 90, opacity: 0, rotate: 0 }, animate: { y: 0, opacity: 1, ...extra }, transition: { ...spring, delay } };

  if (hero.device === "phones") {
    const [a, b, c] = hero.shots;
    return (
      <div className="relative mx-auto flex h-full max-w-[760px] items-end justify-center">
        <motion.div className="absolute bottom-[-14%] left-[4%] w-[30%] origin-bottom" {...rise(0.12, { rotate: -7 })}>
          <PhoneFrame srcs={[a]} alt="" sizes="(min-width: 1024px) 230px, 30vw" />
        </motion.div>
        <motion.div className="absolute bottom-[-14%] right-[4%] w-[30%] origin-bottom" {...rise(0.2, { rotate: 7 })}>
          <PhoneFrame srcs={[c]} alt="" sizes="(min-width: 1024px) 230px, 30vw" />
        </motion.div>
        <motion.div className="relative z-10 mb-[-18%] w-[37%]" {...rise(0)}>
          <PhoneFrame srcs={[b]} alt={`${name} on a phone`} sizes="(min-width: 1024px) 290px, 38vw" priority />
        </motion.div>
      </div>
    );
  }

  if (hero.device === "combo") {
    return (
      <div className="relative mx-auto h-full max-w-[1000px]">
        <motion.div className="absolute bottom-[-10%] left-0 w-[84%]" {...rise(0)}>
          <BrowserFrame srcs={[hero.shot]} domain={domain} alt={`${name} on the web`} priority />
        </motion.div>
        <motion.div className="absolute bottom-[-16%] right-0 w-[22%]" {...rise(0.16)}>
          <PhoneFrame srcs={[hero.phone]} alt={`${name} on a phone`} sizes="220px" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div className="relative mx-auto mb-[-6%] w-full max-w-[1000px]" {...rise(0)}>
      <BrowserFrame srcs={[hero.shot]} domain={domain} alt={`${name} home screen`} priority />
    </motion.div>
  );
}

/*
  A feature: each line is a button, and picking a line shows the screen that
  goes with it. Hover does the same with a mouse.
*/
export function FeatureSwitch({ f, domain, flip }) {
  const [on, setOn] = useState(0);
  const shots = f.shots;
  const shotOf = (i) => Math.min(i, shots.length - 1);
  const phone = isPhone(shots[0]);
  return (
    <div className={`grid items-center gap-10 lg:gap-20 ${phone ? "lg:grid-cols-[1fr_0.85fr]" : "lg:grid-cols-[0.75fr_1.25fr]"}`}>
      <div className={flip ? "lg:order-2" : ""}>
        <h3 className="pf-h3">{f.title}</h3>
        <ul className="mt-7 space-y-1.5">
          {f.lines.map((line, i) => (
            <li key={line}>
              <button
                type="button"
                className="pf-switch"
                aria-pressed={on === i}
                onClick={() => setOn(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setOn(i)}
              >
                {line}
              </button>
            </li>
          ))}
        </ul>
        {shots.length > 1 && (
          <p className="pf-small mt-5">
            Showing: {labelOf(shots[shotOf(on)])}
          </p>
        )}
      </div>
      <div className={`pf-panel pf-settle ${phone ? "pf-panel--phone" : ""}`}>
        <Frame
          srcs={shots}
          on={shotOf(on)}
          alt={labelOf(shots[shotOf(on)])}
          domain={domain}
          className={phone ? "mx-auto w-[min(62%,280px)]" : ""}
          sizes={phone ? "280px" : "(min-width: 1024px) 680px, 92vw"}
        />
      </div>
    </div>
  );
}

/*
  Every screen in one viewer: arrows, thumbnails, the keyboard or a swipe.
*/
export function ScreenViewer({ shots, domain, name }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const still = useReducedMotion();
  const start = useRef(null);
  const thumbs = useRef(null);
  const n = shots.length;
  const go = (to) => {
    const next = (to + n) % n;
    setDir(to > i ? 1 : -1);
    setI(next);
    thumbs.current?.children[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: still ? "auto" : "smooth" });
  };
  const src = shots[i];
  const phone = isPhone(src);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${name} screens`}
      tabIndex={0}
      className="rounded-[28px] outline-offset-4"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      }}
    >
      <div
        className="pf-panel pf-viewer"
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          if (start.current == null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        }}
      >
        <motion.div
          key={src}
          className={phone ? "h-[88%]" : "w-[88%] sm:w-[84%]"}
          style={phone ? { aspectRatio: "0.4754" } : undefined}
          initial={still ? false : { opacity: 0, x: 36 * dir }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        >
          <Frame srcs={[src]} alt={labelOf(src)} domain={domain} sizes={phone ? "320px" : "(min-width: 1024px) 900px, 92vw"} />
        </motion.div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-[15px] font-semibold" aria-live="polite">
          {labelOf(src)} <span className="font-normal text-[var(--hint)] tabular-nums">{i + 1} of {n}</span>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="pf-icon-btn" onClick={() => go(i - 1)} aria-label="Previous screen">
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
          </button>
          <button type="button" className="pf-icon-btn" onClick={() => go(i + 1)} aria-label="Next screen">
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={thumbs} className="pf-thumbs mt-4">
        {shots.map((s, k) => (
          <button
            key={s}
            type="button"
            className={`pf-thumb ${isPhone(s) ? "pf-thumb--phone" : ""}`}
            aria-label={`Show ${labelOf(s)}`}
            aria-current={k === i ? "true" : undefined}
            onClick={() => go(k)}
          >
            <Image src={s} alt="" fill sizes="140px" className="object-cover object-top" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* Palette swatches: tap one to copy its hex value. */
export function Swatches({ palette }) {
  const [copied, setCopied] = useState(null);
  const copy = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
    } catch {
      setCopied(null);
    }
    setTimeout(() => setCopied((h) => (h === hex ? null : h)), 1800);
  };
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {palette.map(([hex, label]) => (
        <li key={hex}>
          <button type="button" className="pf-swatch" onClick={() => copy(hex)} aria-label={`Copy ${label} ${hex}`}>
            <span className="pf-swatch-chip" style={{ background: hex }} />
            <span className="mt-3 block text-[15px] font-semibold">{label}</span>
            <span className="pf-small flex items-center gap-1.5 tabular-nums" aria-live="polite">
              {copied === hex ? (
                <>
                  <Check size={13} weight="bold" aria-hidden="true" /> Copied
                </>
              ) : (
                hex
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
