import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 4173,
    host: 'localhost',
    open: true,
    strictPort: false,
    hmr: {
      host: 'localhost',
      port: 4173
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
