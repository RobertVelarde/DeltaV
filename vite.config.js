import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use '/' when deploying to a custom domain (apex or sub-domain).
  // Change to '/repo-name/' if deploying to a GitHub Pages project URL instead.
  base: '/',
})
