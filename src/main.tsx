import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Ponto de entrada principal da aplicação.
 * Aqui o React é "montado" dentro da div com ID 'root' definida no index.html.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
