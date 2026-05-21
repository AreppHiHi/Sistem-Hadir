import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Kita pasang semula SSL untuk pujuk iPhone
  ],
  server: {
    host: true,
    // INI ADALAH JURUS RAHSIA (PROXY)
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Hala ke Backend anda
        changeOrigin: true,
        secure: false
      }
    }
  }
})