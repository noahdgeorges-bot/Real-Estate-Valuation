import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  preview: {
    host: true,
    port: 3000,
    allowedHosts: true
  },
  server: {
    host: true,
    port: 3000
  }
})
