import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Usa esbuild para minificar (incluido por defecto)
    minify: 'esbuild',
    cssMinify: true,
  },
  server: {
    // Puerto para desarrollo
    port: 3000,
    open: true
  }
})
