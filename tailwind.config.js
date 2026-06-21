/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "var(--color-brand-50, #eff6ff)",
          100: "var(--color-brand-100, #dbeafe)",
          500: "var(--color-brand-500, #3b82f6)",
          600: "var(--color-brand-600, #2563eb)",
          700: "var(--color-brand-700, #1d4ed8)",
          900: "var(--color-brand-900, #1e3a8a)",
        },
      },
    },
  },
  plugins: [],
}

