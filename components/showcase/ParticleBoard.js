"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";
import { useNear } from "@/components/motion/useNear";
import { ProjectDetails, ProjectHeader } from "./ProjectParts";

/*
  Fleet: a dashboard built from particles. Every capture is sampled into a
  grid of coloured points that fly in and assemble into the screen; the sharp
  capture then settles on top of them. Move the cursor over it and the sharp
  layer opens around the pointer while the points underneath scatter out of
  the way. Click to burst the whole screen apart and watch it re-form.
  Scrolling steps through the screens: each new one opens out from the
  centre of the frame like a radar ping.
*/

const MAX_POINTS = 12000;
const CANVAS_DPR = 1.5;

// screen-to-screen: a circle opening from the centre (75% reaches the corners)
const PING_CLOSED = "circle(0% at 50% 50%)";
const PING_OPEN = "circle(75% at 50% 50%)";
const PING_S = 0.85;
const PING_EASE = [0.65, 0, 0.35, 1];

const optimized = (src) => `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const attempt = (url, fallback) => {
      const img = new window.Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => (fallback ? attempt(fallback, null) : reject(new Error(`failed ${src}`)));
      img.src = url;
    };
    attempt(optimized(src), src);
  });
}

class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.off = document.createElement("canvas");
    this.offCtx = this.off.getContext("2d", { willReadFrequently: true });
    this.images = [];
    this.samples = [];
    this.pointer = { x: -1e4, y: -1e4, on: false };
    this.target = 0;
    this.n = 0;
    this.energy = 1;
    this.calm = 0;
    this.running = false;
    this.inView = true;
    this.visible = true;
    this.raf = 0;
    this.loop = this.loop.bind(this);
  }

  resize(w, h) {
    if (!w || !h) return;
    this.w = w;
    this.h = h;
    const dpr = Math.min(CANVAS_DPR, window.devicePixelRatio || 1);
    this.dpr = dpr;
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    this.W = W;
    this.H = H;
    this.canvas.width = W;
    this.canvas.height = H;
    this.imageData = this.ctx.createImageData(W, H);
    this.buf = new Uint32Array(this.imageData.data.buffer);

    const cell = Math.max(5, Math.ceil(Math.sqrt((w * h) / MAX_POINTS)));
    this.cell = cell;
    this.dot = Math.max(2, Math.round(cell * dpr * 0.74));
    this.repel = Math.max(90, Math.min(160, w * 0.14));
    const cols = Math.floor(w / cell);
    const rows = Math.floor(h / cell);
    const n = cols * rows;
    const fresh = n !== this.n;
    this.cols = cols;
    this.rows = rows;
    this.n = n;
    const ox = (w - cols * cell) / 2 + cell / 2;
    const oy = (h - rows * cell) / 2 + cell / 2;
    if (fresh) {
      this.hx = new Float32Array(n);
      this.hy = new Float32Array(n);
      this.x = new Float32Array(n);
      this.y = new Float32Array(n);
      this.vx = new Float32Array(n);
      this.vy = new Float32Array(n);
      this.cr = new Float32Array(n);
      this.cg = new Float32Array(n);
      this.cb = new Float32Array(n);
      this.tr = new Uint8Array(n);
      this.tg = new Uint8Array(n);
      this.tb = new Uint8Array(n);
    }
    for (let i = 0; i < n; i++) {
      this.hx[i] = ox + (i % cols) * cell;
      this.hy[i] = oy + Math.floor(i / cols) * cell;
    }
    if (fresh) this.scatter();
    this.samples = [];
    this.images.forEach((img, i) => {
      if (img) this.samples[i] = this.sample(img);
    });
    this.applyTarget(fresh);
  }

  // the points start anywhere around the frame, so the first screen assembles
  scatter() {
    const { n, x, y, vx, vy, hx, hy, w, h } = this;
    for (let i = 0; i < n; i++) {
      x[i] = hx[i] + (Math.random() - 0.5) * w * 1.6;
      y[i] = hy[i] + (Math.random() - 0.5) * h * 1.6;
      vx[i] = 0;
      vy[i] = 0;
    }
  }

  // one colour per point, from the capture cropped the way the sharp layer is
  // (cover, aligned to the top), downscaled in two steps so colours stay true
  sample(img) {
    const { cols, rows, w, h, off, offCtx } = this;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const fa = w / h;
    const ia = iw / ih;
    let sx = 0;
    let sw = iw;
    let sh = ih;
    if (ia > fa) {
      sw = ih * fa;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / fa;
    }
    const mid = document.createElement("canvas");
    mid.width = cols * 3;
    mid.height = rows * 3;
    const mc = mid.getContext("2d");
    mc.imageSmoothingQuality = "high";
    mc.drawImage(img, sx, 0, sw, sh, 0, 0, mid.width, mid.height);
    off.width = cols;
    off.height = rows;
    offCtx.imageSmoothingQuality = "high";
    offCtx.drawImage(mid, 0, 0, cols, rows);
    return offCtx.getImageData(0, 0, cols, rows).data;
  }

  setImage(i, img) {
    this.images[i] = img;
    if (this.cols) {
      this.samples[i] = this.sample(img);
      if (i === this.target) this.applyTarget(true);
    }
  }

  applyTarget(snap = false) {
    const s = this.samples[this.target];
    if (!s) return;
    const { n, tr, tg, tb, cr, cg, cb } = this;
    for (let i = 0; i < n; i++) {
      const k = i * 4;
      tr[i] = s[k];
      tg[i] = s[k + 1];
      tb[i] = s[k + 2];
      if (snap) {
        cr[i] = tr[i];
        cg[i] = tg[i];
        cb[i] = tb[i];
      }
    }
  }

  // next screen: the points underneath take the new capture's colours at
  // once, so the hover effect always shows the screen that's on top
  retarget(i) {
    this.target = i;
    this.applyTarget(true);
    this.wake();
  }

  burst(px, py, power = 30) {
    const { n, x, y, vx, vy } = this;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - px;
      const dy = y[i] - py;
      const d = Math.hypot(dx, dy) + 1;
      const f = (power / (1 + d * 0.012)) * (0.6 + Math.random() * 0.8);
      vx[i] += (dx / d) * f + (Math.random() - 0.5) * 4;
      vy[i] += (dy / d) * f + (Math.random() - 0.5) * 4;
    }
    this.wake();
  }

  step() {
    const { n, x, y, vx, vy, hx, hy, cr, cg, cb, tr, tg, tb, repel } = this;
    const { x: px, y: py, on } = this.pointer;
    const R2 = repel * repel;
    let energy = 0;
    for (let i = 0; i < n; i++) {
      let ax = (hx[i] - x[i]) * 0.05;
      let ay = (hy[i] - y[i]) * 0.05;
      if (on) {
        const dx = x[i] - px;
        const dy = y[i] - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 0.01;
          const f = 1 - d / repel;
          const s = (f * f * 7) / d;
          ax += dx * s;
          ay += dy * s;
        }
      }
      vx[i] = (vx[i] + ax) * 0.84;
      vy[i] = (vy[i] + ay) * 0.84;
      x[i] += vx[i];
      y[i] += vy[i];
      const dr = tr[i] - cr[i];
      const dg = tg[i] - cg[i];
      const db = tb[i] - cb[i];
      cr[i] += dr * 0.14;
      cg[i] += dg * 0.14;
      cb[i] += db * 0.14;
      energy += Math.abs(vx[i]) + Math.abs(vy[i]) + (Math.abs(dr) + Math.abs(dg) + Math.abs(db)) * 0.01;
    }
    this.energy = energy / Math.max(1, n);
  }

  draw() {
    const { buf, W, H, n, x, y, dpr, cr, cg, cb, dot } = this;
    buf.fill(0);
    const half = dot >> 1;
    for (let i = 0; i < n; i++) {
      const px0 = ((x[i] * dpr) | 0) - half;
      const py0 = ((y[i] * dpr) | 0) - half;
      const x0 = px0 < 0 ? 0 : px0;
      const x1 = px0 + dot > W ? W : px0 + dot;
      const y0 = py0 < 0 ? 0 : py0;
      const y1 = py0 + dot > H ? H : py0 + dot;
      if (x0 >= x1 || y0 >= y1) continue;
      const c = 0xff000000 | ((cb[i] & 255) << 16) | ((cg[i] & 255) << 8) | (cr[i] & 255);
      for (let yy = y0; yy < y1; yy++) {
        let k = yy * W + x0;
        for (let xx = x0; xx < x1; xx++) buf[k++] = c;
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  loop() {
    this.raf = 0;
    if (!this.running) return;
    this.step();
    this.draw();
    const idle = this.energy < 0.03 && !this.pointer.on;
    this.calm = idle ? this.calm + 1 : 0;
    if (this.calm > 30) {
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  wake() {
    if (this.running || !this.inView || !this.visible || !this.n) return;
    this.running = true;
    this.calm = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  pause() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy() {
    this.pause();
    this.images = [];
    this.samples = [];
  }
}

export default function ParticleBoard({ project }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const engine = useRef(null);
  const reduce = useReduced();
  const near = useNear(ref);
  const screens = project.screens;
  const n = screens.length;
  const [index, setIndex] = useState(0);
  // which capture is on top, which one it is opening over, and a counter
  // that restarts the ping ring on every change
  const [view, setView] = useState({ shown: 0, prev: -1, ping: 0 });
  const [dissolve, setDissolve] = useState(false);
  const [fine, setFine] = useState(false);
  const indexRef = useRef(0);
  indexRef.current = index;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    if (next !== index) setIndex(next);
  });

  const rise = useTransform(enter, [0, 1], [130, 0]);
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  // the engine is built and the captures sampled once the section is close;
  // the first assembly plays the moment the frame actually comes on screen,
  // and the loop sleeps whenever the points are at rest and the pointer away
  useEffect(() => {
    if (reduce || !near) return;
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    const eng = new Engine(canvas);
    eng.inView = false;
    // arriving mid-section: sample the screen that's actually showing
    eng.target = indexRef.current;
    engine.current = eng;
    let alive = true;
    let t = 0;

    const measure = () => {
      const r = frame.getBoundingClientRect();
      eng.resize(Math.round(r.width), Math.round(r.height));
      eng.wake();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);

    screens.forEach((s, i) => {
      loadImage(s.src)
        .then((img) => {
          if (!alive) return;
          eng.setImage(i, img);
          eng.wake();
        })
        .catch(() => {});
    });

    let assembled = false;
    const io = new IntersectionObserver(
      ([e]) => {
        eng.inView = e.isIntersecting;
        if (!e.isIntersecting) {
          eng.pause();
          return;
        }
        if (!assembled) {
          // the points fly in from all around and the sharp capture settles on top
          assembled = true;
          eng.scatter();
          setDissolve(true);
          t = setTimeout(() => alive && setDissolve(false), 2200);
        }
        eng.wake();
      },
      { threshold: 0.2 }
    );
    io.observe(frame);
    const onVis = () => {
      eng.visible = document.visibilityState === "visible";
      if (eng.visible) eng.wake();
      else eng.pause();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      clearTimeout(t);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      eng.destroy();
      engine.current = null;
    };
  }, [reduce, near, screens]);

  // a new screen opens out from the centre of the frame, like a radar ping
  // over the old one; the points underneath quietly switch colours
  useEffect(() => {
    setView((v) => (v.shown === index ? v : { shown: index, prev: v.shown, ping: v.ping + 1 }));
    engine.current?.retarget(index);
  }, [index]);

  const local = (e) => {
    const r = frameRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onPointerMove = (e) => {
    const frame = frameRef.current;
    if (!frame) return;
    const { x, y } = local(e);
    frame.style.setProperty("--mx", `${x.toFixed(1)}px`);
    frame.style.setProperty("--my", `${y.toFixed(1)}px`);
    const eng = engine.current;
    if (eng && e.pointerType === "mouse") {
      eng.pointer.x = x;
      eng.pointer.y = y;
      eng.pointer.on = true;
      frame.style.setProperty("--hole", "1");
      eng.wake();
    }
  };
  const onPointerLeave = () => {
    const frame = frameRef.current;
    if (frame) frame.style.setProperty("--hole", "0");
    const eng = engine.current;
    if (eng) {
      eng.pointer.on = false;
      eng.wake();
    }
  };
  const onPointerDown = (e) => {
    const eng = engine.current;
    if (!eng) return;
    const { x, y } = local(e);
    eng.burst(x, y);
    setDissolve(true);
    setTimeout(() => setDissolve(false), 950);
  };

  const step = screens[index];

  return (
    <section
      id={project.slug}
      data-pin=""
      aria-labelledby={`${project.slug}-title`}
      className="relative"
      {...fieldProps({ shape: project.shape, accent: project.accent, anchor: "far-right", alpha: 0.55 })}
    >
      <div ref={ref} style={{ height: `${n * 50 + 100}vh` }}>
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          <div className="wrap grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pb-6 pt-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.5fr)] lg:grid-rows-1 lg:items-center lg:gap-14 lg:pb-0 lg:pt-14">
            <div>
              <ProjectHeader project={project} size="md" />
              <p className="mt-5 hidden max-w-[42ch] text-[16px] leading-relaxed text-muted lg:block">
                {project.summary}
              </p>

              <ol className="relative mt-7 hidden lg:block">
                <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-ink/10" />
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent"
                  style={{ scaleY: fill }}
                />
                {screens.map((s, i) => (
                  <li
                    key={s.src}
                    aria-current={i === index ? "step" : undefined}
                    className={`py-[5px] pl-5 text-[15px] transition-colors duration-200 ease-snap ${
                      i === index ? "font-medium text-ink" : "text-muted"
                    }`}
                  >
                    {s.label}
                  </li>
                ))}
              </ol>
              <p aria-live="polite" className="mt-6 hidden min-h-[2.8rem] max-w-[40ch] text-[15px] leading-snug lg:block">
                <motion.span
                  key={index}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: [0, 0, 0.2, 1] }}
                  className="inline-block text-muted"
                >
                  {step.line}
                </motion.span>
              </p>
              {fine && !reduce && (
                <p className="label mt-8 hidden lg:block">
                  <span className="text-accent" aria-hidden="true">
                    +
                  </span>
                  &nbsp; Move over the dashboard to scatter it. Click to burst.
                </p>
              )}
            </div>

            <div className="flex min-h-0 items-center justify-center lg:justify-end">
              {/* a light window for light-theme captures; the points scatter on a dark floor */}
              <motion.div
                style={reduce ? undefined : { y: rise }}
                className="browser browser--light flex w-full max-w-[min(92vw,calc((100dvh-8rem)*1.6))] flex-col aspect-[16/10] lg:w-auto lg:h-[min(66dvh,560px)]"
              >
                <div className="browser-bar shrink-0">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                  </span>
                  <span className="truncate font-mono text-[12px] text-muted">
                    {project.domain ?? "fleet / live tracking"}
                  </span>
                  <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.12em] text-muted/80 sm:block">
                    particles
                  </span>
                </div>
                <div
                  ref={frameRef}
                  onPointerMove={onPointerMove}
                  onPointerLeave={onPointerLeave}
                  onPointerDown={onPointerDown}
                  className="pboard relative flex-1 touch-pan-y select-none overflow-hidden bg-[#0b0c10]"
                >
                  {!reduce && <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />}
                  <div className={`pboard-sharp absolute inset-0 ${dissolve ? "opacity-0" : "opacity-100"}`}>
                    {screens.map((s, i) => {
                      // "in" opens over "under"; everything else waits closed
                      const role = i === view.shown ? "in" : i === view.prev ? "under" : "off";
                      return (
                        <motion.div
                          key={s.src}
                          className="absolute inset-0"
                          initial={false}
                          animate={role === "off" ? { clipPath: PING_CLOSED, opacity: 0 } : { clipPath: PING_OPEN, opacity: 1 }}
                          transition={
                            role === "in" && !reduce
                              ? { clipPath: { duration: PING_S, ease: PING_EASE }, opacity: { duration: 0 } }
                              : { duration: 0 }
                          }
                          style={{ zIndex: role === "in" ? 2 : role === "under" ? 1 : 0 }}
                          aria-hidden={role !== "in"}
                        >
                          <Image
                            src={s.src}
                            alt={`${project.name}: ${s.label}`}
                            fill
                            sizes="(min-width: 1024px) 60vw, 92vw"
                            quality={90}
                            loading={near ? "eager" : "lazy"}
                            fetchPriority="low"
                            draggable={false}
                            className="object-cover object-top"
                          />
                        </motion.div>
                      );
                    })}
                    {/* the ping: a ring that rides the edge of the opening capture */}
                    {view.ping > 0 && !reduce && (
                      <motion.span
                        key={view.ping}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 z-[3] aspect-square w-[128%] rounded-full border-2 border-accent shadow-[0_0_40px_rgb(var(--accent)/0.6),inset_0_0_40px_rgb(var(--accent)/0.35)]"
                        style={{ x: "-50%", y: "-50%" }}
                        initial={{ scale: 0.02, opacity: 1 }}
                        animate={{ scale: 1, opacity: [1, 0.9, 0] }}
                        transition={{ scale: { duration: PING_S, ease: PING_EASE }, opacity: { duration: PING_S, times: [0, 0.75, 1] } }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:hidden">
              <div className="mb-3 flex gap-1.5" aria-hidden="true">
                {screens.map((s, i) => (
                  <span
                    key={s.src}
                    className={`h-[3px] flex-1 rounded-full transition-colors duration-200 ${
                      i <= index ? "bg-accent" : "bg-ink/15"
                    }`}
                  />
                ))}
              </div>
              <p aria-live="polite" className="min-h-[3.4rem] text-[15px] leading-snug">
                <span className="font-medium">{step.label}. </span>
                <span className="text-muted">{step.line}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProjectDetails project={project} />
    </section>
  );
}
