import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'pages',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '/styles': resolve(__dirname, 'styles'),
      '/js': resolve(__dirname, 'js'),
      '/utils': resolve(__dirname, 'utils')
    }
  }
});
