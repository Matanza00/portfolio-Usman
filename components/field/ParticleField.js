"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildRandoms, buildShapes } from "./shapes";

/*
  One draw call for the whole site: a cloud of points that morphs between
  shapes as the page scrolls. Sections opt in with data attributes:

    data-shape="bars" data-accent="#35d6a0" data-anchor="far-right"
    data-alpha="0.5" data-alpha-end="0.2"

  The cloud holds a section's shape while that section is pinned and morphs
  to the next one in the gap between sections. Everything is a pure function
  of scroll position, so scrubbing backwards lands on exactly the same frame.
*/

const vert = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aRand;
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uAlpha;
  uniform float uPulse;
  uniform float uScale;
  uniform vec2 uPointer;
  varying float vAlpha;

  vec3 drift(vec3 p, float t) {
    return vec3(
      sin(p.y * 2.1 + t) + sin(p.z * 1.7 - t * 0.7),
      sin(p.z * 2.3 + t * 1.1) + sin(p.x * 1.9 + t * 0.5),
      sin(p.x * 2.2 - t * 0.8) + sin(p.y * 1.6 + t)
    );
  }

  void main() {
    // each particle leaves at its own moment, so shapes dissolve and re-form
    float t = clamp((uMix - aRand.x * 0.6) / 0.4, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(position, aTarget, t);

    float mid = sin(3.14159265 * t);
    p += drift(p * 1.3 + aRand.y * 6.2831, uTime * 0.35) * (0.24 * mid + 0.012);

    // the orb breathes like a voice
    p += normalize(p + 0.0001) * sin(uTime * 2.4 + p.y * 5.0 + aRand.y * 2.0) * 0.035 * uPulse;

    // particles step away from the pointer
    vec2 away = p.xy - uPointer;
    float d = length(away);
    p.xy += (away / (d + 0.0001)) * smoothstep(0.75, 0.0, d) * 0.16;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand.z * 0.9) * (6.0 / -mv.z) * clamp(uScale, 0.5, 1.15);
    vAlpha = uAlpha * (0.5 + 0.5 * aRand.z);
  }
`;

const frag = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = THREE.MathUtils.lerp;

function measureStops() {
  const vh = window.innerHeight;
  return [...document.querySelectorAll("[data-shape]")].map((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const alpha = Number(el.dataset.alpha ?? 0.5);
    // right edge of the section's text block, if it marks one with data-field-clear
    const text = el.querySelector("[data-field-clear]");
    let clearRight = null;
    if (text) {
      const range = document.createRange();
      range.selectNodeContents(text);
      clearRight = range.getBoundingClientRect().right;
    }
    // an element the cloud should sit exactly on (centre and size, in px);
    // y is measured inside the section's pinned frame
    const target = el.querySelector("[data-field-at]");
    const frame = el.querySelector("[data-field-frame]");
    let at = null;
    if (target && frame) {
      const t = target.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      at = { cx: t.left + t.width / 2, cy: t.top - f.top + t.height / 2, size: Math.min(t.width, t.height) };
    }
    // where the pinned part of the section ends (the details follow in normal flow)
    const pinned = el.hasAttribute("data-pin") ? el.firstElementChild : null;
    const pinEnd = pinned ? Math.max(top, top + pinned.offsetHeight - vh) : null;
    return {
      at,
      pinEnd,
      clearRight,
      start: top,
      end: Math.max(top, top + el.offsetHeight - vh),
      shape: el.dataset.shape,
      color: new THREE.Color(el.dataset.accent || "#7ea2ff"),
      anchor: el.dataset.anchor || "right",
      narrow: el.dataset.anchorNarrow,
      // px the DOM centre sits below the viewport centre (keeps cloud and DOM concentric)
      offsetY: Number(el.dataset.offsetY ?? 0),
      alpha,
      alphaEnd: Number(el.dataset.alphaEnd ?? alpha),
    };
  });
}

// Where the cloud sits, in world units. Wide screens use the section's anchor.
// Below 1024px there is no empty column to sit in, so a section either
// reserves a band for the cloud (narrow: top / mid / center) or the cloud
// becomes a faint backdrop. Text never rests on a bright cloud.
function place(stop, vw, vh, out) {
  const px = window.innerWidth;
  out.x = 0;
  out.y = -(stop.offsetY / window.innerHeight) * vh;
  out.s = 1;
  out.dim = 1;

  if (stop.at) {
    const unit = px / vw; // pixels per world unit
    out.x = (stop.at.cx / px - 0.5) * vw;
    out.y = -(stop.at.cy / window.innerHeight - 0.5) * vh;
    out.s = stop.at.size / unit / 2.9; // the globe with its orbits is ~2.9 units across
    return out;
  }

  if (px < 1024) {
    if (stop.narrow === "top") {
      out.y += vh * 0.285;
      out.s = 0.48;
      out.dim = 0.8;
    } else if (stop.narrow === "mid") {
      out.y += vh * 0.04;
      out.s = 0.6;
      out.dim = 0.75;
    } else if (stop.narrow === "center") {
      out.s = 0.72;
    } else {
      out.s = 1.05;
      out.dim = 0.25;
    }
    return out;
  }

  const tight = px < 1280;
  switch (stop.anchor) {
    case "right":
      if (stop.clearRight != null) {
        // fit into whatever the text leaves free, at any screen size
        const left = stop.clearRight + 36;
        const right = px - 28;
        const unit = px / vw; // pixels per world unit
        out.s = Math.min(1, Math.max(0, right - left) / (2.75 * unit));
        out.x = ((left + right) / 2 / px - 0.5) * vw;
      } else {
        out.x = vw * (tight ? 0.3 : 0.25);
        out.s = tight ? 0.78 : 1;
      }
      break;
    case "left":
      out.x = -vw * 0.25;
      break;
    case "far-right":
      out.x = vw * 0.3;
      out.s = 0.7;
      break;
    case "top-right":
      out.x = vw * 0.26;
      out.y += vh * 0.17;
      out.s = 0.74;
      break;
    case "top":
      // a small mark in the empty space above the content
      out.y += vh * 0.33;
      out.s = 0.3;
      break;
    case "center":
      out.s = 0.8;
      break;
    case "back":
      out.s = 1.6;
      break;
  }
  return out;
}

function Cloud({ count }) {
  const group = useRef(null);
  const gl = useThree((s) => s.gl);
  const viewport = useThree((s) => s.viewport);
  const stops = useRef([]);
  const current = useRef(-1);
  const pointer = useRef({ x: 0, y: 0 });
  const born = useRef(null);
  const pa = useRef({ x: 0, y: 0, s: 1, dim: 1 });
  const pb = useRef({ x: 0, y: 0, s: 1, dim: 1 });

  const shapes = useMemo(() => buildShapes(count), [count]);

  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(shapes.stack), 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(new Float32Array(shapes.stack), 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(buildRandoms(count), 3));
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uMix: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 2.3 },
        uPixelRatio: { value: 1 },
        uAlpha: { value: 0 },
        uPulse: { value: 0 },
        uScale: { value: 1 },
        uPointer: { value: new THREE.Vector2(99, 99) },
        uColor: { value: new THREE.Color("#7ea2ff") },
      },
    });
    return { geo: g, mat: m };
  }, [shapes, count]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  useEffect(() => {
    const measure = () => {
      stops.current = measureStops();
      current.current = -1;
    };
    measure();
    // text extents change once the web font arrives
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useFrame(({ clock }) => {
    const list = stops.current;
    const g = group.current;
    if (!g || list.length === 0) return;
    const u = mat.uniforms;
    const time = clock.elapsedTime;
    if (born.current === null) born.current = time;

    const y = window.scrollY;
    let i = 0;
    while (i < list.length - 1 && y >= list[i + 1].start) i++;
    const a = list[i];
    const b = list[i + 1] ?? a;

    if (i !== current.current) {
      current.current = i;
      geo.attributes.position.array.set(shapes[a.shape] ?? shapes.stack);
      geo.attributes.aTarget.array.set(shapes[b.shape] ?? shapes.stack);
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aTarget.needsUpdate = true;
    }

    const t = b === a ? 0 : clamp01((y - a.end) / Math.max(1, b.start - a.end));
    const e = smooth(t);
    const holdEnd = a.pinEnd ?? a.end;
    const hold = holdEnd > a.start ? clamp01((y - a.start) / (holdEnd - a.start)) : 0;
    // 0 while pinned, 1 once the details below have scrolled in
    const after = a.pinEnd != null ? clamp01((y - a.pinEnd) / (window.innerHeight * 0.45)) : 0;

    const A = place(a, viewport.width, viewport.height, pa.current);
    const B = place(b, viewport.width, viewport.height, pb.current);
    const s = lerp(A.s, B.s, e);
    g.position.set(lerp(A.x, B.x, e), lerp(A.y, B.y, e), 0);
    g.scale.setScalar(s);
    g.rotation.y = Math.sin(time * 0.16) * 0.2 + pointer.current.x * 0.14;
    g.rotation.x = -pointer.current.y * 0.09;

    const intro = clamp01((time - born.current) / 1.4);
    const held = lerp(a.alpha, a.alphaEnd, hold);
    const alphaA = lerp(held, Math.min(held, 0.07), after) * A.dim;
    u.uAlpha.value = lerp(alphaA, b.alpha * B.dim, e) * intro;
    u.uMix.value = t;
    u.uScale.value = s;
    u.uTime.value = time;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uPulse.value = (a.shape === "orb" ? 1 - e : 0) + (b.shape === "orb" ? e : 0);
    u.uColor.value.lerpColors(a.color, b.color, e);
    u.uPointer.value.set(
      ((pointer.current.x * viewport.width) / 2 - g.position.x) / s,
      ((pointer.current.y * viewport.height) / 2 - g.position.y) / s
    );
  });

  return (
    <group ref={group}>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </group>
  );
}

export default function ParticleField({ count, maxDpr, active }) {
  return (
    <Canvas
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      dpr={[1, maxDpr]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 35, near: 0.1, far: 50, position: [0, 0, 6] }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Cloud count={count} />
    </Canvas>
  );
}
