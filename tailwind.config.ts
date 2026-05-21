import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          950: "#0b0b0c",
        },
        brand: {
          graphite: "#101113",
          charcoal: "#0b0c0f",
          amber: "#f6c07a",
          forest: "#1a3b2f",
          offwhite: "#f3efe7",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(246, 192, 122, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
