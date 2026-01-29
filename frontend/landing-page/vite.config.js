import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 4173,
    host: 'localhost',
    open: false,  // Disabled auto-open to prevent continuous reopening
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
