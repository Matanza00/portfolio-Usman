/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Tokens live in app/globals.css. --accent is overridden per project section.
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        ink: token("ink"),
        muted: token("muted"),
        accent: token("accent"),
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        wrap: "1240px",
      },
      // Z-index scale: rail < nav < grain < skip link.
      zIndex: {
        rail: "30",
        nav: "40",
        grain: "50",
        skip: "60",
      },
      transitionTimingFunction: {
        // soft landing for reveals, snappy for controls
        land: "cubic-bezier(0.16, 1, 0.3, 1)",
        snap: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};
