import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Google OAuth Client ID — read from env at build time.
// Checked in vite.config so it's guaranteed to be embedded in the bundle
// even when .env is absent (e.g. Vercel, where env vars are in process.env).
const GOOGLE_CLIENT_ID = (
  process.env.VITE_GOOGLE_CLIENT_ID ||
  '1075452650948-c3kinkp9imgn4ikumrmifojtn4eaj9ce.apps.googleusercontent.com'
).trim()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __GOOGLE_CLIENT_ID__: JSON.stringify(GOOGLE_CLIENT_ID),
  },
})
