// Scroll progress (0..1) to a position along a list of n screens (0..n-1).
// Every screen holds still for a stretch of the scroll and the move to the
// next one happens in the middle of that stretch, eased, so each capture can
// be read before it changes.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (x) => x * x * (3 - 2 * x);

const LEAD = 0.04; // a little stillness at the very start and end
const HOLD = 0.22; // share of each step spent holding at either end

export function holdProgress(p, n) {
  if (n < 2) return 0;
  const raw = clamp((p - LEAD) / (1 - 2 * LEAD), 0, 1) * (n - 1);
  const seg = Math.min(n - 2, Math.floor(raw));
  const u = raw - seg;
  return seg + smooth(clamp((u - HOLD) / (1 - 2 * HOLD), 0, 1));
}

// The scroll progress at which screen i sits still (the inverse, for jumps).
export function holdScroll(i, n) {
  if (n < 2) return 0;
  return LEAD + (1 - 2 * LEAD) * (i / (n - 1));
}

// Scroll a pinned section to the progress p of its pinned range.
export function scrollToProgress(el, p, reduce) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const range = el.offsetHeight - window.innerHeight;
  const y = top + p * range;
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}
