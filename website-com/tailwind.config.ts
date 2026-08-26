import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1C2C",
        bone: "#F7F4EF",
        champagne: "#C4A574",
        mist: "#E8E2D9",
        success: "#2F5D50",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-arabic)", "serif"],
        sans: ["var(--font-sans)", "var(--font-arabic)", "system-ui", "sans-serif"],
        ar: ["var(--font-arabic)", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.18em",
      },
      borderRadius: {
        gi: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
