import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: rootDir,
  plugins: [vue()],
  resolve: {
    alias: {
      '@efs/schema': resolve(rootDir, '../../packages/schema/src/index.ts'),
    },
  },
  build: {
    outDir: resolve(rootDir, 'dist'),
    emptyOutDir: true,
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
