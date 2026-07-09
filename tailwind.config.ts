import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        btc: {
          teal: "#17aa96",
          "teal-dark": "#0f6f62",
          gray: "#676766",
          white: "#ffffff",
          gold: "#c2a268",
        },
        surface: "#f5f8f7",
        ink: "#14211e",
        instrument: "#0b211d",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: ["var(--font-spectral)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        document:
          "0 1px 2px rgba(15, 30, 28, 0.04), 0 20px 48px -12px rgba(15, 30, 28, 0.18)",
        seal: "0 8px 24px -6px rgba(23, 170, 150, 0.45)",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
