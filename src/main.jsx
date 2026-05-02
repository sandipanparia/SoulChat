import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from './utils/ThemeContext'
import './index.css'
import App from './App.jsx'

/* global __GOOGLE_CLIENT_ID__ */
const googleClientId = typeof __GOOGLE_CLIENT_ID__ !== 'undefined' ? __GOOGLE_CLIENT_ID__ : import.meta.env.VITE_GOOGLE_CLIENT_ID

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
