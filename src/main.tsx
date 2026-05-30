import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { RepositoryContext } from './context/RepositoryContext'
import { exerciseRepository, muscleRepository } from './data/static/repositoryFactory'

// Composition root: the one place the concrete static repositories are
// imported and injected. Everything below depends only on the interfaces.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RepositoryContext.Provider value={{ exerciseRepository, muscleRepository }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RepositoryContext.Provider>
  </StrictMode>,
)
