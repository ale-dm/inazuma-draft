import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import './app.css'
import App from './App'
import { AppSettingsProvider } from './context/AppSettings'
import CatalogGate from './components/CatalogGate'
import { initAnalytics } from './lib/analytics'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSettingsProvider>
      <CatalogGate>
        <App />
      </CatalogGate>
      <Analytics />
    </AppSettingsProvider>
  </StrictMode>,
)
