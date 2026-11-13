"use client";

import { Microphone } from "@phosphor-icons/react";
import { startVoice } from "@/lib/voice";
import { useVoice } from "./VoiceDock";

// "Or talk it through": starts the voice assistant from the dark contact band.
export function VoiceButton() {
  const v = useVoice();
  const live = v.status === "connecting" || v.status === "live";
  return (
    <button
      type="button"
      onClick={startVoice}
      disabled={live}
      className="pf-btn border-[1.5px] border-white/25 text-white hover:border-white/60 disabled:opacity-60"
    >
      <Microphone size={17} weight="bold" aria-hidden="true" />
      {live ? "Assistant is on" : "Talk it through by voice"}
    </button>
  );
}
