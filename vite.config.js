import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// Configuración base de Vite para el MVP de Magic-Juris (Reto 3 — HG Abogados).
export default defineConfig({
  plugins: [
    react(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    })
  ],
  server: {
    port: 5173,
    open: true,
    // Proxy al backend (Express en :3001) para que el front llame /api/... sin CORS.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
