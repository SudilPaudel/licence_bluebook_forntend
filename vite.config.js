import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/payment-verification\/.*/, to: '/index.html' },
        { from: /^\/dashboard.*/, to: '/index.html' },
        { from: /^\/bluebook\/.*/, to: '/index.html' },
        { from: /^\/electric-bluebook\/.*/, to: '/index.html' },
        { from: /^\/payment\/.*/, to: '/index.html' },
        { from: /^\/profile.*/, to: '/index.html' },
        { from: /^\/admin-dashboard.*/, to: '/index.html' },
      ]
    },
    proxy: {
      '/auth': 'http://localhost:9005',
      '/bluebook': 'http://localhost:9005',
      '/electric-bluebook': 'http://localhost:9005',
      '/news': 'http://localhost:9005',
      '/marquee': 'http://localhost:9005',
      // Removed '/admin' proxy so /admin-dashboard is handled by React Router
      '/payment': 'http://localhost:9005',
    },
  },
})
