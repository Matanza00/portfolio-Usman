/*
  The portfolio's voice assistant: an ElevenLabs agent that talks about my work
  and moves the page while it talks. One session for the whole site; any
  button can start it, and the dock in the layout shows it.

  While a call is on, <html> carries data-voice ("connecting", "listening" or
  "speaking") and --voice-lvl (1 to 1.3, from the live volume), so anything on
  the page can react to it in CSS.
*/

export const VOICE_AGENT_ID = "agent_5601m7b8e3bwfnjv0dm3qkbb6wfw";

let state = { status: "idle", mode: "listening", lines: [], error: "" };
const subs = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((f) => f(state));
};
export const getVoice = () => state;
export const subscribeVoice = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};

let convo = null;
let raf = 0;
let starting = false;
let navigate = (href) => (window.location.href = href);
export const setVoiceNavigator = (fn) => {
  navigate = fn;
};

const html = () => document.documentElement;
const mark = (v) => {
  if (v) html().dataset.voice = v;
  else delete html().dataset.voice;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(selector, ms = 4000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const el = document.querySelector(selector);
    if (el) return el;
    await sleep(80);
  }
  return null;
}
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const onHome = () => window.location.pathname === "/";

async function goHome() {
  if (onHome()) return;
  navigate("/");
  await waitFor("#live");
  await sleep(150);
}
async function show(id) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    return true;
  }
  const el = await waitFor(`#${id}`);
  el?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  return !!el;
}

const SECTIONS = { top: "top", live: "live", cases: "cases", about: "about", contact: "contact" };
const CASES = ["karighar", "ifund", "atomic-muscles", "obyect", "subyect", "zestlead", "fleet", "facility", "garagepal"];
const FILTERS = ["all", "3d", "business", "app", "ai"];

const clientTools = {
  show_section: async ({ section }) => {
    const id = SECTIONS[section];
    if (!id) return "Unknown section.";
    await goHome();
    await show(id);
    return `The ${section} section is on screen.`;
  },
  filter_live_sites: async ({ filter }) => {
    if (!FILTERS.includes(filter)) return "Unknown filter.";
    await goHome();
    window.dispatchEvent(new CustomEvent("pf:filter", { detail: filter }));
    await show("live");
    return `The live sites are filtered to ${filter}.`;
  },
  open_case_study: async ({ slug }) => {
    if (!CASES.includes(slug)) return "There is no case study with that name.";
    navigate(`/work/${slug}`);
    await waitFor("#case-title");
    window.scrollTo({ top: 0 });
    return `The ${slug} case study is open.`;
  },
};

function meter() {
  if (!convo) return;
  let v = 0;
  try {
    v = state.mode === "speaking" ? convo.getOutputVolume() : convo.getInputVolume();
  } catch {}
  html().style.setProperty("--voice-lvl", (1 + Math.min(0.3, v * 0.9)).toFixed(3));
  raf = requestAnimationFrame(meter);
}

function addLine(role, raw) {
  // the voice reads expression tags like [happy]; the transcript should not
  const text = (raw || "").replace(/\[[a-z][a-z ]*\]\s*/gi, "").trim();
  if (!text || /^\.+$/.test(text)) return;
  set({ lines: [...state.lines, { role, text, id: Date.now() + Math.random() }].slice(-4) });
}

function ended(message = "") {
  cancelAnimationFrame(raf);
  convo = null;
  mark(null);
  html().style.removeProperty("--voice-lvl");
  set({ status: message ? "error" : "ended", error: message });
}

export async function startVoice() {
  if (convo || starting) return;
  starting = true;
  set({ status: "connecting", error: "", lines: [] });
  mark("connecting");
  try {
    // ask for the microphone first, so a refusal gets a clear message
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
    } catch {
      throw new Error("mic");
    }
    const { Conversation } = await import("@elevenlabs/client");
    convo = await Conversation.startSession({
      agentId: VOICE_AGENT_ID,
      // websocket sends this site's origin, which the agent's allowlist checks
      connectionType: "websocket",
      clientTools,
      onConnect: () => {
        set({ status: "live", mode: "listening" });
        mark("listening");
      },
      onDisconnect: (d) => {
        // a call that closes before anyone spoke, and not because you ended it, did not work
        const failed = d?.reason === "error" || (d?.reason !== "user" && state.lines.length === 0);
        if (failed) console.warn("Voice assistant disconnected:", d?.reason, d?.message || d?.closeReason || "");
        ended(failed ? "The assistant could not connect. Try again in a moment, or email me instead." : "");
      },
      onMessage: (m) => addLine(m.role === "user" || m.source === "user" ? "you" : "ai", m.message),
      onModeChange: ({ mode }) => {
        set({ mode });
        if (convo) mark(mode);
      },
      onError: (msg) => console.warn("Voice assistant:", msg),
    });
    meter();
  } catch (e) {
    convo = null;
    ended(
      e?.message === "mic"
        ? "The assistant needs your microphone. Allow it for this site and try again, or email me instead."
        : "The assistant could not connect. Try again in a moment, or email me instead."
    );
  } finally {
    starting = false;
  }
}

export async function stopVoice() {
  const c = convo;
  if (!c) return ended();
  try {
    await c.endSession();
  } catch {}
  ended();
}

export const closeVoice = () => set({ status: "idle", error: "", lines: [] });
