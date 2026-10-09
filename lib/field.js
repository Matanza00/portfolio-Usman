// Helpers for sections that drive the particle field and carry an accent.
// A section can also mark children for the field to measure:
//   data-field-clear  the text block; an anchor="right" cloud fits beside it
//   data-field-at     an element the cloud should sit exactly on
//   data-field-frame  the pinned frame that data-field-at is positioned in

export const BASE_ACCENT = "#7ea2ff";

export function hexToTriplet(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Spread onto a <section>: tells the field which shape to form there, where to
// sit and how bright to be, and sets the section's --accent colour.
export function fieldProps({ shape, accent = BASE_ACCENT, anchor = "right", alpha = 0.5, alphaEnd, offsetY, narrow }) {
  return {
    "data-anchor-narrow": narrow,
    "data-offset-y": offsetY,
    "data-shape": shape,
    "data-accent": accent,
    "data-anchor": anchor,
    "data-alpha": alpha,
    "data-alpha-end": alphaEnd ?? alpha,
    style: { "--accent": hexToTriplet(accent) },
  };
}
