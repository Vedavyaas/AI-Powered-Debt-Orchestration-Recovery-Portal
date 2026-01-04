import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/debt': 'http://localhost:8080',
      '/user': 'http://localhost:8080',
      '/backlog': 'http://localhost:8080',
      '/put': 'http://localhost:8080',
      '/get': 'http://localhost:8080',
      '/change': 'http://localhost:8080',
      '/delete': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/create': 'http://localhost:8080'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
}))
