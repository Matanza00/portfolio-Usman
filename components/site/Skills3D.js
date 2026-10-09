"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { SKILL_GROUPS } from "@/lib/profile";
import { fieldProps } from "@/lib/field";
import { useReduced } from "@/components/motion/useReduced";

const G = SKILL_GROUPS.length;
const SKILLS = SKILL_GROUPS.flatMap((g, group) => g.skills.map((name) => ({ name, group })));
const N = SKILLS.length;

// Labels sit on a Fibonacci sphere, top to bottom in group order, so each
// group owns a band of latitude.
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const POINTS = SKILLS.map((_, i) => {
  const y = 1 - ((i + 0.5) * 2) / N;
  const r = Math.sqrt(1 - y * y);
  return [Math.cos(GOLDEN * i) * r, y, Math.sin(GOLDEN * i) * r];
});
// Tilt that brings each group's band round to face the viewer.
const TILTS = SKILL_GROUPS.map((_, g) => {
  const ys = POINTS.filter((_, i) => SKILLS[i].group === g).map((p) => p[1]);
  const mean = ys.reduce((a, b) => a + b, 0) / ys.length;
  return Math.max(-0.8, Math.min(0.8, Math.asin(mean)));
});

/*
  Skills as a globe. Every label is placed in 3D and projected each frame, so
  nearer skills are larger and brighter. The globe spins on its own, tilts to
  the active group as the page scrolls, and can be dragged. The particle field
  draws the sphere and its orbits behind the labels (data-field-at).
*/
export default function Skills3D() {
  const ref = useRef(null);
  const stage = useRef(null);
  const labels = useRef([]);
  const motion = useRef({ spin: 0.6, tilt: TILTS[0], vel: 0, dragTilt: 0, drag: null, active: 0 });
  const reduce = useReduced();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(G - 1, Math.max(0, Math.floor(v * G)));
    if (next !== active) setActive(next);
  });

  useEffect(() => {
    motion.current.active = active;
  }, [active]);

  useEffect(() => {
    const el = stage.current;
    if (!el || reduce) return;
    const m = motion.current;
    let raf = 0;
    let running = false;
    let last = 0;

    const draw = () => {
      // a slightly tighter globe on phones, so long labels stay on screen
      const side = Math.min(el.clientWidth, el.clientHeight);
      const R = side * (side < 420 ? 0.34 : 0.41);
      const cs = Math.cos(m.spin);
      const sn = Math.sin(m.spin);
      const ct = Math.cos(m.tilt);
      const st = Math.sin(m.tilt);
      for (let i = 0; i < N; i++) {
        const node = labels.current[i];
        if (!node) continue;
        const [px, py, pz] = POINTS[i];
        const x = px * cs + pz * sn;
        const z1 = -px * sn + pz * cs;
        const y = py * ct - z1 * st;
        const z = py * st + z1 * ct;
        const depth = (z + 1) / 2; // 0 at the back, 1 at the front
        const on = SKILLS[i].group === m.active;
        node.style.transform = `translate(-50%, -50%) translate3d(${(x * R).toFixed(1)}px, ${(-y * R).toFixed(1)}px, 0) scale(${(0.72 + depth * 0.42 + (on ? 0.08 : 0)).toFixed(3)})`;
        node.style.opacity = (on ? 0.62 + depth * 0.38 : 0.14 + depth * 0.3).toFixed(2);
        node.style.zIndex = String(Math.round(depth * 100));
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!m.drag) {
        m.spin += (0.22 + m.vel) * dt;
        m.vel *= Math.exp(-2.6 * dt);
        m.dragTilt *= Math.exp(-2 * dt);
      }
      m.tilt += (TILTS[m.active] + m.dragTilt - m.tilt) * (1 - Math.exp(-4 * dt));
      draw();
      raf = requestAnimationFrame(tick);
    };

    // only animate while the globe is on screen
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(el);
    draw();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  // drag to spin; on touch only a sideways drag counts, so vertical scroll still works
  const onPointerDown = (e) => {
    motion.current.drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, live: e.pointerType === "mouse", t: performance.now() };
  };
  const onPointerMove = (e) => {
    const m = motion.current;
    const d = m.drag;
    if (!d) return;
    if (!d.live) {
      const dx = Math.abs(e.clientX - d.x);
      if (dx < 10 || dx < Math.abs(e.clientY - d.y)) return;
      d.live = true;
    }
    const now = performance.now();
    const dx = e.clientX - d.lx;
    m.spin += dx * 0.008;
    m.dragTilt = Math.max(-0.7, Math.min(0.7, m.dragTilt - (e.clientY - d.ly) * 0.006));
    m.vel = Math.max(-6, Math.min(6, (dx * 0.008) / Math.max(0.008, (now - d.t) / 1000)));
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.t = now;
  };
  const endDrag = () => {
    motion.current.drag = null;
  };

  const jump = (i) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / G) * (el.offsetHeight - window.innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const heading = (
    <>
      <p className="label">Skills</p>
      <h2 id="skills-title" className="mt-4 max-w-[14ch] text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1] tracking-[-0.045em]">
        The stack I build with.
      </h2>
    </>
  );

  // Reduced motion: no pin and no globe, just every group in full.
  if (reduce) {
    return (
      <section id="skills" aria-labelledby="skills-title" className="relative border-t border-ink/10 py-28 sm:py-36">
        <div className="wrap">
          {heading}
          <ul className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {SKILL_GROUPS.map((g) => (
              <li key={g.title} className="border-t border-ink/10 pt-4">
                <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{g.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{g.skills.join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const current = SKILL_GROUPS[active];

  return (
    <section
      id="skills"
      data-pin=""
      aria-labelledby="skills-title"
      className="relative border-t border-ink/10"
      {...fieldProps({ shape: "globe", anchor: "center", alpha: 0.34 })}
    >
      <div ref={ref} className="h-[330vh]">
        <div data-field-frame="" className="sticky top-0 h-[100dvh] overflow-hidden">
          <div className="wrap grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pb-8 pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:grid-rows-1 lg:items-center lg:gap-12 lg:pb-0 lg:pt-14">
            <div>
              {heading}
              <p className="mt-5 hidden max-w-[44ch] text-[16px] leading-relaxed text-muted lg:block">
                Six areas I work in every week. Scroll to move through them, or drag the globe.
              </p>

              {/* wide screens: every group, the current one lit */}
              <ul className="mt-8 hidden lg:block">
                {SKILL_GROUPS.map((g, i) => {
                  const on = i === active;
                  return (
                    <li key={g.title}>
                      <button
                        type="button"
                        onClick={() => jump(i)}
                        aria-current={on ? "true" : undefined}
                        className={`flex w-full items-baseline gap-5 border-l py-2.5 pl-5 text-left transition-colors duration-200 ease-snap ${
                          on ? "border-accent" : "border-ink/10 hover:border-ink/35"
                        }`}
                      >
                        <span className={`w-[7.5rem] shrink-0 text-[15px] font-medium ${on ? "text-ink" : "text-muted"}`}>
                          {g.title}
                        </span>
                        <span className={`text-[14px] leading-relaxed ${on ? "text-ink/85" : "text-muted"}`}>
                          {g.skills.join(", ")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* small screens show one group at a time; the full list stays available to screen readers */}
              <ul className="sr-only lg:hidden">
                {SKILL_GROUPS.map((g) => (
                  <li key={g.title}>
                    {g.title}: {g.skills.join(", ")}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex min-h-0 items-center justify-center">
              <div
                ref={stage}
                data-field-at=""
                aria-hidden="true"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
                onPointerCancel={endDrag}
                className="relative aspect-square w-[min(100%,54dvh)] cursor-grab touch-pan-y select-none active:cursor-grabbing lg:h-[min(64dvh,580px)] lg:w-auto"
              >
                {SKILLS.map((s, i) => (
                  <span
                    key={s.name}
                    ref={(node) => {
                      labels.current[i] = node;
                    }}
                    className={`absolute left-1/2 top-1/2 whitespace-nowrap font-mono text-[13px] font-medium will-change-transform sm:text-[14px] ${
                      s.group === active ? "text-accent" : "text-ink"
                    }`}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:hidden" aria-hidden="true">
              <div className="mb-3 flex gap-1.5">
                {SKILL_GROUPS.map((g, i) => (
                  <span
                    key={g.title}
                    className={`h-[3px] flex-1 rounded-full transition-colors duration-200 ${i <= active ? "bg-accent" : "bg-ink/15"}`}
                  />
                ))}
              </div>
              <p className="min-h-[4.6rem] text-[15px] leading-snug">
                <span className="font-medium">{current.title}. </span>
                <span className="text-muted">{current.skills.join(", ")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
