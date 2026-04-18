import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: rootDir,
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@efs': resolve(rootDir, '../../src'),
    },
  },
  build: {
    outDir: resolve(rootDir, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('vuetify')) return 'vuetify'
          if (id.includes('vue-i18n') || id.includes('@vueuse') || id.includes('/vue/')) return 'vue-vendor'
          return 'vendor'
        },
      },
    },
  },
  server: {
    allowedHosts: ['agentos.bytesucceed.com'],
    proxy: {
      '/agentos-api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/agentos-api/, ''),
      },
    },
  },
  preview: {
    allowedHosts: ['agentos.bytesucceed.com'],
    proxy: {
      '/agentos-api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/agentos-api/, ''),
      },
    },
  },
})
