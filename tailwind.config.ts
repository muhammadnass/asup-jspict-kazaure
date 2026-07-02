import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#00692D",
          deep: "#003D1A",
          light: "#00923F",
        },
        gold: {
          DEFAULT: "#FFD400",
          light: "#FFE066",
        },
        red: {
          DEFAULT: "#B3261E",
          deep: "#8A1D17",
        },
        cream: "#FAFAF7",
        ink: "#171717",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(0,105,45,0.06) 40px)",
      },
    },
  },
  plugins: [],
};

export default config;
