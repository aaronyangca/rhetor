import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy the API to the Flask dev server so the browser sees one origin.
    // Session cookies then just work, with no CORS and no cross-site cookie
    // rules to fight.
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
      '/admin': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
})
