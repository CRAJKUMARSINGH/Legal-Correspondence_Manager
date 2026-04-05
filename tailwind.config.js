/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      colors: {
        legal: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          600: '#2d4a8a',
          700: '#1e3570',
          800: '#152860',
          900: '#0d1b45',
        },
      },
    },
  },
  plugins: [],
}
