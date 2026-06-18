/** @type {import('tailwindcss').Config} */
// Configuración de Tailwind con la identidad de marca Hurtado Gandini (Dark Premium).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de marca HG
        hg: {
          bg: '#0D0D0D', // Fondo negro profundo
          surface: '#161616', // Superficie nivel 1
          surface2: '#1E1E1E', // Superficie nivel 2
          red: '#C5202E', // Acento rojo corporativo
          amber: '#B8621A', // Criticidad importante
          blue: '#1A5C8A', // Criticidad informativa
        },
      },
      fontFamily: {
        // Sora para títulos, Inter para cuerpo (importadas en index.css)
        sora: ['Sora', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        critical: '0 0 12px rgba(197,32,46,0.6)',
      },
      keyframes: {
        'pulse-critical': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(197,32,46,0.45)' },
          '50%': { boxShadow: '0 0 18px rgba(197,32,46,0.85)' },
        },
      },
      animation: {
        'pulse-critical': 'pulse-critical 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
