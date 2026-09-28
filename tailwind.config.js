/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0e17',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        brand: {
          purple: '#6366f1',
          indigo: '#4f46e5',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          accent: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
