import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        panel: "#151821",
        panel2: "#1a1f2b",
        accent: "#4f46e5"
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px"
      }
    },
  },
  plugins: []
} satisfies Config
