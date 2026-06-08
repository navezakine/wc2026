import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ mode }) => {
  const plugins = [react()]

  if (mode === 'development') {
    const { inspectorServer } = await import('react-dev-inspector/lib/plugins/vite')
    plugins.push(inspectorServer())
  }

  return {
    plugins,
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  }
})
