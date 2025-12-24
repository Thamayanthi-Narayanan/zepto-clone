import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { 
        target: 'https://f271534d6156.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      '/auth': { 
        target: 'https://f271534d6156.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
// https://hyperactively-florescent-addilyn.ngrok-free.dev