/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        locus: {
          50: '#f5f5ff',
          100: '#ebebff',
          200: '#d6d6ff',
          300: '#b3b3ff',
          400: '#8686ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
