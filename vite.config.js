import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      // Ensure Google Client ID is always available at build time
      // Falls back to the project's OAuth Client ID when .env is absent (e.g. Vercel)
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(
        env.VITE_GOOGLE_CLIENT_ID || '1075452650948-c3kinkp9imgn4ikumrmifojtn4eaj9ce.apps.googleusercontent.com'
      ),
    },
  }
})
