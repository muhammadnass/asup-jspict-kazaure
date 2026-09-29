import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        asup: {
          primary: "#003366",
          secondary: "#FFB81C",
        },
      },
    },
  },
  plugins: [],
};

export default config;