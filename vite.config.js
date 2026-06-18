import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración base de Vite para el MVP de Magic-Juris (Reto 3 — HG Abogados).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
