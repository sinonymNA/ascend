/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        bg: '#0F1729',
        'bg-mid': '#162038',
        card: '#1E2D4A',
        'card-hover': '#243556',
        border: '#2D3F60',
        gold: '#FFB830',
        coral: '#E8445A',
        green: '#2ECC71',
        purple: '#7B4FE9',
        'blue-light': '#5B9CF6',
        text: '#F0F4FF',
        'text-mid': '#8FA3C8',
        'text-dim': '#4D6080',
      },
    },
  },
  plugins: [],
};
