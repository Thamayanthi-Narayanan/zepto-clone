import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
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
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url);
          });
        },
      },
      '/auth': { 
        target: 'https://hyperactively-florescent-addilyn.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, 
      },
      '/ws-chat': {
        target: 'https://hyperactively-florescent-addilyn.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('WebSocket proxy error', err);
          });
        },
      },
    },
  },
})