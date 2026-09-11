import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { fontFamily: { sans: ["var(--font-manrope)", "sans-serif"], display: ["var(--font-newsreader)", "serif"] }, boxShadow: { soft: "0 24px 70px rgba(31, 14, 41, .10)" } } },
  plugins: []
} satisfies Config;
