import { useState, useEffect, useRef } from 'react';

/**
 * Hook personalizado para gerenciar estado sincronizado com o localStorage do navegador.
 * Inclui debounce de 300ms para evitar escritas excessivas e tratamento de erros robusto.
 * @param key A chave sob a qual o valor será armazenado no localStorage.
 * @param initialValue O valor inicial caso não haja nada armazenado.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicializa o estado. A função de inicialização lê do localStorage apenas uma vez na montagem.
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Req 16.2: JSON corrompido — usar initialValue como fallback e logar no console
      console.error(`[useLocalStorage] Falha ao ler/parsear dados da chave "${key}". Usando valor inicial como fallback.`, error);
      return initialValue;
    }
  });

  // Ref para armazenar o timer de debounce (Req 9.1, 9.2, 9.3)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Req 9.2: Cancelar timer anterior antes de criar um novo
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    // Req 9.1: Atrasar a persistência em 300ms após a última mudança
    timerRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        // Req 9.4 / 16.1: Capturar QuotaExceededError, manter estado em memória
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error(`[useLocalStorage] Armazenamento cheio (QuotaExceededError) ao salvar a chave "${key}". O estado será mantido apenas em memória.`, error);
          // Toast será integrado na tarefa 10 (ToastContext)
        } else {
          console.error(`[useLocalStorage] Erro ao salvar na chave "${key}":`, error);
        }
      }
    }, 300);

    // Req 9.3: Limpar timer pendente no cleanup para evitar memory leaks
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
