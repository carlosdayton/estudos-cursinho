import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar estado sincronizado com o localStorage do navegador.
 * @param key A chave sob a qual o valor será armazenado no localStorage.
 * @param initialValue O valor inicial caso não haja nada armazenado.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicializa o estado. A função de inicialização lê do localStorage apenas uma vez na montagem.
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Tenta buscar o item do localStorage pela chave fornecida
      const item = window.localStorage.getItem(key);
      // Se o item existir, converte de JSON para objeto; se não, usa o valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Caso ocorra algum erro na leitura (ex: JSON corrompido), exibe o erro e usa o valor inicial
      console.error("Erro ao ler do localStorage:", error);
      return initialValue;
    }
  });

  // useEffect que dispara sempre que a 'key' ou o 'storedValue' mudarem
  useEffect(() => {
    try {
      // Converte o valor atual para string JSON e salva no localStorage
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // Caso ocorra erro na gravação (ex: armazenamento cheio)
      console.error("Erro ao salvar no localStorage:", error);
    }
  }, [key, storedValue]); // Dependências do efeito

  // Retorna o valor atual e a função para atualizá-lo, como um useState padrão
  return [storedValue, setStoredValue] as const;
}
