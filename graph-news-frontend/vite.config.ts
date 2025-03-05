// filepath: /home/Irmin/Desktop/IngenieriaSoftware/graph-news/graph-news-frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Specify the output directory
    rollupOptions: {
      input: 'index.html' // Use index.html as the entry point
    }
  }
})