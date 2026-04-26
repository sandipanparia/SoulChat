/**
 * Returns the base URL for all API requests.
 * 
 * - In development: uses VITE_API_URL or falls back to localhost:5000
 * - On Vercel/production: uses the same origin (empty string) since the
 *   serverless API lives at /api/* on the same domain
 * - On LAN (mobile testing): uses the device's hostname with port 5000
 */
export function getApiBaseUrl() {
  // 1. If an explicit env var is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  const hostname = window.location.hostname

  // 2. If we're on localhost or 127.0.0.1, the dev server is on port 5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000'
  }

  // 3. If hostname is an IP address (LAN testing from mobile), use that IP with port 5000
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return `http://${hostname}:5000`
  }

  // 4. Production (Vercel, Netlify, etc.) — API is on the same origin
  return ''
}
