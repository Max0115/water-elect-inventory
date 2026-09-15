/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#21252D',
          card: '#2A2E37',
          border: '#373D4A',
          text: '#E1E4EA',
          muted: '#8E96A4',
          accent: '#3B82F6',
        }
      }
    },
  },
  plugins: [],
}