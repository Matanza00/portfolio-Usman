"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { X } from "@phosphor-icons/react";
import { startVoice } from "@/lib/voice";
import { useVoice } from "./VoiceDock";

/*
  Mini me: an illustrated version of my photo that walks the visitor through
  the page from the bottom-left corner.
  - His eyes and head follow the cursor.
  - As you scroll, he takes the pose of whatever is in the middle of the
    screen (any element with data-guide="pose" and data-say="...") and says a
    line about it: waving in the hero, pointing at each live site, presenting
    the case studies, hand on heart in About, both hands up at Contact.
  - Hovering a case study, or flipping the hero deck, makes him name it.
  - He leans with the speed of your scroll.
  - Click him to start the voice assistant; while it talks, his mouth moves
    with its voice and his hands gesture.
*/

const C = {
  skin: "#cf946f",
  skinDark: "#b97a57",
  ear: "#c08260",
  hair: "#1c1715",
  beard: "#3a2a22",
  suit: "#33363d",
  suitDark: "#26282e",
  shirt: "#f6f3ec",
};

// arm angles: [left upper, left fore, right upper, right fore]; right arm out = negative
const POSES = {
  idle: [10, -8, -10, 8],
  wave: [10, -8, -148, -20],
  point: [10, -8, -98, -18],
  present: [40, -108, -40, 108],
  chest: [10, -8, 28, 128],
  cheer: [158, 12, -158, -12],
  think: [10, -8, 22, 150],
};
const TALK = ["present", "point", "chest", "present"];


/*
  SVG parts turn around fixed points in the drawing (shoulder, elbow, neck),
  so they use plain CSS transforms with transform-box: view-box. Motion would
  measure from each part's own bounding box and swing them from the wrong spot.
*/
function Arm({ side, upper, fore, wave, still }) {
  const L = side === "left";
  const sx = L ? 63 : 177; // shoulder
  return (
    <g className="pf-guide-joint" style={{ transform: `rotate(${upper}deg)`, transformOrigin: `${sx}px 172px` }}>
      <rect x={sx - 13} y={162} width={26} height={60} rx={13} fill={C.suit} stroke={C.suitDark} strokeWidth={1.5} />
      <g
        className={`pf-guide-joint${wave && !still ? " pf-guide-wave" : ""}`}
        style={{ "--fore": `${fore}deg`, transform: `rotate(${fore}deg)`, transformOrigin: `${sx}px 216px` }}
      >
        <rect x={sx - 12} y={210} width={24} height={52} rx={12} fill="#3a3d45" stroke={C.suitDark} strokeWidth={1.5} />
        <rect x={sx - 11} y={254} width={22} height={8} rx={3} fill={C.shirt} />
        <circle cx={sx} cy={270} r={11} fill={C.skin} />
        <ellipse cx={L ? sx + 9 : sx - 9} cy={265} rx={4} ry={6.5} fill={C.skin} transform={`rotate(${L ? -30 : 30} ${L ? sx + 9 : sx - 9} 265)`} />
      </g>
    </g>
  );
}

function Figure({ pose, wave, look, still, talking }) {
  const [lu, lf, ru, rf] = POSES[pose] || POSES.idle;
  const head = useMotionTemplate`translate(${look.hx}px, ${look.hy}px) rotate(${look.tilt}deg)`;
  const eyes = useMotionTemplate`translate(${look.px}px, ${look.py}px)`;
  return (
    <svg viewBox="0 0 240 280" className="pf-guide-svg" aria-hidden="true">
      {/* body, breathing */}
      <g className={still ? undefined : "pf-guide-breathe"}>
        <path d="M52 186 C52 162 80 152 104 149 L136 149 C160 152 188 162 188 186 L198 290 L42 290 Z" fill={C.suit} />
        <path d="M104 149 L136 149 L120 200 Z" fill={C.shirt} />
        <path d="M101 151 L92 170 L116 218 L120 202 Z" fill={C.suitDark} />
        <path d="M139 151 L148 170 L124 218 L120 202 Z" fill={C.suitDark} />
        <path d="M104 149 L112 168 L98 162 Z" fill="#ffffff" stroke="#ddd8cd" strokeWidth={1} />
        <path d="M136 149 L128 168 L142 162 Z" fill="#ffffff" stroke="#ddd8cd" strokeWidth={1} />
        <circle cx={120} cy={238} r={3} fill={C.suitDark} />
        <path d="M150 210 l15 -3 l0 5 l-15 3 z" fill={C.shirt} opacity={0.9} />
        <rect x={108} y={128} width={24} height={26} rx={9} fill={C.skinDark} />
      </g>

      <Arm side="left" upper={lu} fore={lf} still={still} />
      <Arm side="right" upper={ru} fore={rf} wave={wave} still={still} />

      {/* head: tilts toward the cursor, turning at the neck */}
      <motion.g style={{ transform: head, transformOrigin: "120px 140px", transformBox: "view-box" }}>
        <ellipse cx={84} cy={100} rx={7} ry={11} fill={C.ear} />
        <ellipse cx={156} cy={100} rx={7} ry={11} fill={C.ear} />
        <ellipse cx={120} cy={97} rx={36} ry={44} fill={C.skin} />
        {/* beard and moustache */}
        <path d="M85 98 C87 130 103 143 120 143 C137 143 153 130 155 98 C151 118 140 127 120 127 C100 127 89 118 85 98 Z" fill={C.beard} opacity={0.6} />
        <path d="M106 113 C112 108 128 108 134 113 C128 111.5 112 111.5 106 113 Z" fill="#2a1d17" />
        {/* mouth: a smile, and an open mouth that moves with the voice */}
        <path d="M108 118 Q120 129 132 118 Q120 124 108 118 Z" fill="#ffffff" stroke="#5a2a22" strokeWidth={1.2} className="pf-guide-smile" data-talking={talking} />
        <ellipse cx={120} cy={121} rx={7.5} ry={5} fill="#5a2a22" className="pf-guide-mouth" data-talking={talking} />
        {/* nose */}
        <path d="M120 92 L116 106 Q120 109 124 106" fill="none" stroke="#a8694d" strokeWidth={1.6} strokeLinecap="round" />
        {/* eyes follow the cursor */}
        <ellipse cx={106} cy={92} rx={6.2} ry={4.4} fill="#ffffff" />
        <ellipse cx={134} cy={92} rx={6.2} ry={4.4} fill="#ffffff" />
        <motion.g style={{ transform: eyes }}>
          <circle cx={106} cy={92} r={2.9} fill="#1d1512" />
          <circle cx={134} cy={92} r={2.9} fill="#1d1512" />
        </motion.g>
        <g className="pf-guide-blink">
          <rect x={98} y={86} width={16} height={11} fill={C.skin} />
          <rect x={126} y={86} width={16} height={11} fill={C.skin} />
        </g>
        {/* brows lift when he talks or cheers */}
        <g className="pf-guide-joint" style={{ transform: `translateY(${talking || pose === "cheer" ? -2.5 : 0}px)` }}>
          <path d="M97 84 Q106 78.5 114 83" fill="none" stroke="#1d1714" strokeWidth={3.6} strokeLinecap="round" />
          <path d="M126 83 Q134 78.5 143 84" fill="none" stroke="#1d1714" strokeWidth={3.6} strokeLinecap="round" />
        </g>
        {/* hair, with the swept-up front */}
        <path d="M83 94 C77 62 95 40 123 39 C150 38 168 57 160 94 C158 81 152 73 146 69 C139 77 121 71 112 62 C104 72 92 75 87 94 Z" fill={C.hair} />
        <path d="M108 48 C122 41 142 44 152 56" fill="none" stroke="#3a312c" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <path d="M83 94 C81 86 82 80 85 76 L88 92 Z M157 92 L160 78 C162 84 162 89 160 94 Z" fill={C.hair} />
      </motion.g>
    </svg>
  );
}

const pick = (els) => {
  // the most specific element (deepest in the page) wins, so a site card beats its section
  let best = null;
  let depth = -1;
  for (const el of els) {
    let d = 0;
    for (let p = el; p; p = p.parentElement) d++;
    if (d > depth) {
      depth = d;
      best = el;
    }
  }
  return best;
};

export default function Guide() {
  const path = usePathname();
  const still = useReducedMotion();
  const voice = useVoice();
  const box = useRef(null);
  const [hidden, setHidden] = useState(false);
  const [scene, setScene] = useState({ pose: "wave", say: "Hi, I'm Usman. Drag a card to flip through my live sites." });
  const [hover, setHover] = useState(null);
  const [talkPose, setTalkPose] = useState(0);

  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem("pf-guide") === "off");
    } catch {}
  }, []);

  // what is in the middle of the screen
  useEffect(() => {
    const live = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? live.add(e.target) : live.delete(e.target);
        const el = pick(live);
        if (el) setScene({ pose: el.dataset.guide || "idle", say: el.dataset.say || "" });
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    const scan = () => document.querySelectorAll("[data-guide]").forEach((el) => io.observe(el));
    const t = setTimeout(scan, 300);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [path]);

  // hover lines from the case list and the hero deck
  useEffect(() => {
    let t;
    const on = (e) => {
      clearTimeout(t);
      setHover(e.detail || null);
      if (e.detail?.ttl) t = setTimeout(() => setHover(null), e.detail.ttl);
    };
    window.addEventListener("pf:guide", on);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pf:guide", on);
    };
  }, []);

  // eyes and head follow the cursor
  const px = useSpring(useMotionValue(0), { stiffness: 300, damping: 25 });
  const py = useSpring(useMotionValue(0), { stiffness: 300, damping: 25 });
  const tilt = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });
  const hx = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });
  const hy = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });
  useEffect(() => {
    if (still) return;
    const on = (e) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.33;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      px.set((dx / d) * 2.6);
      py.set((dy / d) * 1.8);
      tilt.set(Math.max(-9, Math.min(9, dx / 90)));
      hx.set(Math.max(-4, Math.min(4, dx / 200)));
      hy.set(Math.max(-3, Math.min(3, dy / 260)));
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [still, px, py, tilt, hx, hy]);

  // lean with the speed of the scroll
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const lean = useSpring(useTransform(v, [-2500, 0, 2500], [-7, 0, 7]), { stiffness: 140, damping: 18 });
  const bob = useSpring(useTransform(v, [-2500, 0, 2500], [6, 0, -6]), { stiffness: 140, damping: 18 });

  // gestures while the assistant talks
  const talking = voice.status === "live" && voice.mode === "speaking";
  const onCall = voice.status === "live" || voice.status === "connecting";
  useEffect(() => {
    if (!talking || still) return;
    const id = setInterval(() => setTalkPose((i) => (i + 1) % TALK.length), 1400);
    return () => clearInterval(id);
  }, [talking, still]);

  const pose = talking ? TALK[talkPose] : onCall ? "think" : hover?.pose || scene.pose;
  const say = onCall ? (talking ? "" : voice.status === "connecting" ? "Connecting…" : "I'm listening.") : hover?.say || scene.say;

  // on a phone the bubble covers the page, so each line shows for a few seconds only
  const [quiet, setQuiet] = useState(false);
  useEffect(() => {
    setQuiet(false);
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const t = setTimeout(() => setQuiet(true), 3800);
    return () => clearTimeout(t);
  }, [say]);

  if (hidden) return null;

  return (
    <div className="pf-guide" ref={box}>
      <AnimatePresence mode="wait">
        {say && !quiet && (
          <motion.p
            key={say}
            className="pf-guide-say"
            aria-hidden="true"
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            {say}
          </motion.p>
        )}
      </AnimatePresence>
      <motion.div
        initial={still ? false : { y: 170 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.6 }}
      >
        <motion.button
          type="button"
          className="pf-guide-me"
          onClick={startVoice}
          aria-label="Talk to my AI assistant"
          style={still ? undefined : { rotate: lean, y: bob, transformOrigin: "50% 100%" }}
          whileHover={still ? undefined : { scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Figure pose={pose} wave={pose === "wave"} look={{ px, py, tilt, hx, hy }} still={still} talking={talking} />
        </motion.button>
      </motion.div>
      <button
        type="button"
        className="pf-guide-x"
        aria-label="Hide the little me"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem("pf-guide", "off");
          } catch {}
        }}
      >
        <X size={12} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
