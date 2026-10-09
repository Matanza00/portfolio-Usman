"use client";

import { useRef } from "react";

// A small editor window with a file tree. The border has an accent light that
// sweeps around it (see .codewin in globals.css), and a blurred spotlight
// follows the cursor across the window, pooled behind the code.

const TREE = [
  { depth: 0, name: "obyect-mcp/", kind: "root" },
  { depth: 1, name: "server.ts", kind: "ts" },
  { depth: 1, name: "tools/", kind: "dir" },
  { depth: 2, name: "scrape.ts", kind: "ts" },
  { depth: 2, name: "classify.ts", kind: "ts" },
  { depth: 2, name: "search.ts", kind: "ts" },
  { depth: 1, name: "resources/", kind: "dir" },
  { depth: 2, name: "ads.json", kind: "json" },
  { depth: 2, name: "triggers.json", kind: "json" },
  { depth: 1, name: "schema/", kind: "dir" },
  { depth: 2, name: "ad.ts", kind: "ts" },
  { depth: 2, name: "context.ts", kind: "ts" },
];

const COLOR = {
  root: "font-semibold text-ink/90",
  dir: "text-ink/70",
  ts: "text-accent",
  json: "text-[#e3b667]",
};

export default function CodeWindow({ title = "obyect-mcp", className = "" }) {
  const faceRef = useRef(null);

  const onMove = (e) => {
    const el = faceRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(1)}px`);
    el.style.setProperty("--my", `${(e.clientY - r.top).toFixed(1)}px`);
    el.style.setProperty("--spot", "1");
  };
  const onLeave = () => {
    faceRef.current?.style.setProperty("--spot", "0");
  };

  const at = "at var(--mx, 50%) var(--my, 50%)";

  return (
    <div className={`codewin w-full max-w-[460px] ${className}`}>
      <div ref={faceRef} onPointerMove={onMove} onPointerLeave={onLeave} className="codewin-face">
        {/* an accent glow pooled at the top, like the recording */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: "radial-gradient(60% 80% at 50% -10%, rgb(var(--accent) / 0.12), transparent 70%)" }}
        />
        {/* the spotlight: a wide blurred pool of light under the pointer... */}
        <span
          aria-hidden="true"
          className="codewin-spot pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(280px circle ${at}, rgb(var(--accent) / 0.6), rgb(var(--accent) / 0.2) 40%, transparent 70%)`,
            filter: "blur(22px)",
          }}
        />
        {/* ...a brighter core... */}
        <span
          aria-hidden="true"
          className="codewin-spot pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(130px circle ${at}, rgb(var(--accent) / 0.35), transparent 70%)`,
          }}
        />
        {/* ...and the window edge lighting up nearest the pointer */}
        <span
          aria-hidden="true"
          className="codewin-spot codewin-edge pointer-events-none absolute inset-0 rounded-[13px]"
          style={{
            background: `radial-gradient(240px circle ${at}, rgb(var(--accent)), transparent 70%)`,
          }}
        />
        <div className="relative z-10 flex h-9 items-center gap-3 border-b border-ink/10 bg-surface-2 px-3.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          </span>
          <span className="font-mono text-[12px] text-muted">{title}</span>
        </div>

        <ul className="relative z-10 space-y-[7px] p-5 font-mono text-[13px] leading-none sm:text-[13.5px]">
          {TREE.map((n) => (
            <li
              key={n.name}
              className="flex items-center gap-2"
              style={{ paddingLeft: `${n.depth * 1.15}rem` }}
            >
              {n.depth > 0 && (
                <span className="text-muted/40" aria-hidden="true">
                  ·
                </span>
              )}
              <span className={COLOR[n.kind]}>{n.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
