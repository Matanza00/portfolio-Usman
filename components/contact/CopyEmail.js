"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export default function CopyEmail({ email, className = "btn btn-ghost" }) {
  const [state, setState] = useState("idle"); // idle | copied | failed
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  };

  return (
    <button type="button" onClick={copy} className={className}>
      {state === "copied" ? (
        <Check size={16} weight="bold" aria-hidden="true" />
      ) : (
        <Copy size={16} aria-hidden="true" />
      )}
      <span aria-live="polite">
        {state === "copied" ? "Email copied" : state === "failed" ? "Copy failed, select it instead" : "Copy email"}
      </span>
    </button>
  );
}
