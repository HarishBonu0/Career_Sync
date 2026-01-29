import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 4173,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
