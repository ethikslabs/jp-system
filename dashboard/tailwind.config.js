/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#13131A',
        border: '#1F1F2E',
        primary: '#F8F8F2',
        secondary: '#6B7280',
        zone1: '#60A5FA',
        zone2: '#2DD4BF',
        zone3: '#FBBF24',
        zone4: '#F97316',
        zone5: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
