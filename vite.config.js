import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { 
        target: 'https://hyperactively-florescent-addilyn.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      },
      '/auth': { 
        target: 'https://hyperactively-florescent-addilyn.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
