import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1C2826",
          50: "#F2F5F4",
          100: "#E2E8E6",
          200: "#C4D0CC",
          700: "#243431",
          800: "#1C2826",
          900: "#141D1C",
          deep: "#16211F",
          soft: "#2A3B36",
        },
        moss: {
          DEFAULT: "#2D4A34",
          50: "#F4F7F4",
          100: "#E6ECE6",
          200: "#C8D7C9",
          300: "#A5BFA7",
          400: "#6F9A74",
          500: "#4D7853",
          600: "#3B6141",
          700: "#2D4A34",
          800: "#233A29",
          900: "#192B1E",
          light: "#3F5E43",
          pale: "#E6ECE6",
        },
        lime: {
          DEFAULT: "#A3E635",
          soft: "#C6F97B",
        },
        sage: {
          DEFAULT: "#EAF0EA",
          deep: "#D8E4D8",
        },
        stone: {
          DEFAULT: "#1C1917",
          soft: "#292524",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
