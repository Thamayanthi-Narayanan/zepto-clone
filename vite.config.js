import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections (for mobile testing)
    port: 5173,
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok.app',
      'localhost'
    ],
    proxy: {
      '/api': { 
        target: 'https://hyperactively-florescent-addilyn.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, 
      },
      '/auth': { 
        target: 'https://hyperactively-florescent-addilyn.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, 
      },
    },
  },
})