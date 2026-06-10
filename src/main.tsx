import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { RepositoryContext } from './context/RepositoryContext'
import { exerciseRepository, muscleRepository } from './data/static/repositoryFactory'
import { AuthProvider } from './features/auth/AuthContext'
import { applyDocumentLanguage, getActiveLanguage } from './config/i18n'

// Apply the active language's <html lang>/<dir> before first paint (RTL for ar).
applyDocumentLanguage(getActiveLanguage())

// Composition root: the one place the concrete static repositories are
// imported and injected. Everything below depends only on the interfaces.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RepositoryContext.Provider value={{ exerciseRepository, muscleRepository }}>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </RepositoryContext.Provider>
  </StrictMode>,
)
