import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { inspectorServer } from 'react-dev-inspector/plugins/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), inspectorServer()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express backend during development
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
