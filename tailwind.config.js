/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        titanium: {
          900: '#050505',
          800: '#0a0a0a',
          700: '#121212',
          DEFAULT: '#050505'
        },
        accent: {
          soccer: '#10b981', // Emerald
          nba: '#f97316',    // Orange
          mlb: '#3b82f6',    // Blue
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
