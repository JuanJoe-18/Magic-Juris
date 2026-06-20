/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hg: {
          bg: '#141414',
          surface: '#1C1C1C',
          border: '#3A3A3A',
          gray: '#D9D9D9',
          red: '#84120C',
          wine: '#782C2C',
          hover: '#A30F0A',
        },
      },
      fontFamily: {
        sora: ['Sora', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
