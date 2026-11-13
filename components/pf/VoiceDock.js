"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Microphone, PhoneDisconnect, X } from "@phosphor-icons/react";
import { closeVoice, getVoice, setVoiceNavigator, startVoice, stopVoice, subscribeVoice } from "@/lib/voice";

const IDLE = { status: "idle", mode: "listening", lines: [], error: "" };

export function useVoice() {
  return useSyncExternalStore(subscribeVoice, getVoice, () => IDLE);
}

const LABEL = { connecting: "Connecting", listening: "Listening", speaking: "Speaking" };

/* The assistant's face: my photo inside a ring that breathes with the voice. */
export function VoiceAvatar({ size = 40 }) {
  return (
    <span className="pf-vavatar" style={{ width: size, height: size }} aria-hidden="true">
      <img src="/me/gray-sm.webp" alt="" width={size} height={size} />
    </span>
  );
}

/*
  Bottom-right dock, on every page. Closed it is a pill; during a call it
  opens into a small card with the status, the last lines said, and End call.
*/
export default function VoiceDock() {
  const router = useRouter();
  const v = useVoice();
  useEffect(() => setVoiceNavigator((href) => router.push(href, { scroll: false })), [router]);

  const open = v.status === "connecting" || v.status === "live" || v.status === "error";
  const state = v.status === "connecting" ? "connecting" : v.mode;

  return (
    <div className="pf-voice">
      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.section
            key="card"
            className="pf-voice-card"
            aria-label="Voice assistant"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center gap-3">
              <VoiceAvatar size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-tight">My AI assistant</p>
                <p className="text-[13px] text-[var(--v-sub)]" aria-live="polite">
                  {v.status === "error" ? "Not connected" : LABEL[state]}
                </p>
              </div>
              {v.status === "error" ? (
                <button type="button" className="pf-voice-x" onClick={closeVoice} aria-label="Close the assistant">
                  <X size={16} weight="bold" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {v.status === "error" ? (
              <>
                <p className="mt-4 text-[14px] leading-relaxed text-[var(--v-sub)]">{v.error}</p>
                <button type="button" className="pf-voice-btn mt-4" onClick={startVoice}>
                  <Microphone size={16} weight="bold" aria-hidden="true" />
                  Try again
                </button>
              </>
            ) : (
              <>
                <ol className="pf-voice-lines mt-4" aria-live="polite">
                  {v.lines.length === 0 && (
                    <li className="text-[var(--v-sub)]">
                      {v.status === "connecting" ? "Starting the call…" : "Say hello. Ask about a project, a stack or how to hire me."}
                    </li>
                  )}
                  {v.lines.map((l) => (
                    <li key={l.id} data-role={l.role}>
                      {l.text}
                    </li>
                  ))}
                </ol>
                <button type="button" className="pf-voice-btn pf-voice-btn--end mt-4" onClick={stopVoice}>
                  <PhoneDisconnect size={16} weight="bold" aria-hidden="true" />
                  End call
                </button>
                <p className="mt-3 text-[12px] leading-snug text-[var(--v-sub)]">
                  An AI assistant, not me. It uses your microphone and can move this page.
                </p>
              </>
            )}
          </motion.section>
        ) : (
          <motion.button
            key="pill"
            type="button"
            className="pf-voice-pill"
            onClick={startVoice}
            aria-label="Talk to my AI assistant"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            whileTap={{ scale: 0.96 }}
          >
            <VoiceAvatar size={34} />
            <span className="hidden sm:inline" aria-hidden="true">Talk to my AI assistant</span>
            <Microphone size={17} weight="bold" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
