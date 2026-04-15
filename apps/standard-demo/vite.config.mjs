import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: rootDir,
  plugins: [vue()],
  build: {
    outDir: resolve(rootDir, 'dist'),
    emptyOutDir: true,
  },
})
