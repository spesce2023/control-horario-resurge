import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F7F0E4",
        card: "#FDFBF5",
        olive: "#5C4E33",
        sage: {
          DEFAULT: "#6E7F52",
          dark: "#4F5C3B",
          bg: "#E7ECDC",
        },
        terracotta: {
          DEFAULT: "#B5652E",
          bg: "#F3E2D3",
        },
        secondary: "#8A7F6A",
        border: "#E4DACB",
        danger: {
          DEFAULT: "#B23A2E",
          bg: "#F3E0DC",
        },
        neg: {
          bg: "#EFE6D8",
          text: "#8A6A3F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
