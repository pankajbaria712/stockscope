/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#020617',
        cyanGlow: '#22d3ee',
      },
      boxShadow: {
        premium: '0 20px 60px rgba(2, 8, 23, 0.25)',
      },
    },
  },
  plugins: [],
}

