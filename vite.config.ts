import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Configuração do Vite para o projeto.
 * Aqui definimos quais plugins o Vite deve usar para processar os arquivos.
 */
export default defineConfig({
  // O plugin 'react' habilita o suporte ao JSX/TSX e o Fast Refresh (HMR)
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
