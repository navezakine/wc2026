import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(async ({ mode }) => {
  const plugins = [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      manifest: {
        name: 'WC 2026 ניחושים',
        short_name: 'WC 2026',
        description: 'ניחושי מונדיאל 2026',
        theme_color: '#0b1020',
        background_color: '#0b1020',
        display: 'standalone',
        start_url: '/',
        lang: 'he',
        dir: 'rtl',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ]

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
