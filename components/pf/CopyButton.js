"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export default function CopyButton({ text }) {
  const [state, setState] = useState("idle"); // idle | done | failed
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2400);
  };
  const done = state === "done";
  return (
    <button type="button" onClick={copy} className="pf-btn border-[1.5px] border-white/25 text-white hover:border-white/60">
      {done ? <Check size={17} weight="bold" aria-hidden="true" /> : <Copy size={17} weight="bold" aria-hidden="true" />}
      <span aria-live="polite">{done ? "Copied" : state === "failed" ? "Copy blocked, select the address" : "Copy email"}</span>
    </button>
  );
}
