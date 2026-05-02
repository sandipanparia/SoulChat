import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from './utils/ThemeContext'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1075452650948-6lopcc3754071e8lnjr2mumn1e9egk5c.apps.googleusercontent.com'

const appTree = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
) : (
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {appTree}
  </StrictMode>,
)
