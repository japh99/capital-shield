import { useState, useCallback } from 'react';

interface UseApiKeysOptions {
  initialIndex?: number;
}

/**
 * Hook para gestionar el pool de API keys con rotación automática
 */
export const useApiKeys = (keys: string[], options: UseApiKeysOptions = {}) => {
  const { initialIndex = 0 } = options;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [errorCount, setErrorCount] = useState(0);

  const getCurrentKey = useCallback(() => {
    return keys[currentIndex];
  }, [currentIndex, keys]);

  const rotateKey = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % keys.length;
      return next;
    });
    setErrorCount((prev) => prev + 1);
  }, [keys.length]);

  const resetErrors = useCallback(() => {
    setErrorCount(0);
  }, []);

  const getKeyInfo = useCallback(() => ({
    current: keys[currentIndex],
    masked: keys[currentIndex].substring(0, 8) + '...',
    total: keys.length,
    index: currentIndex,
    errorCount
  }), [currentIndex, keys, errorCount]);

  return {
    getCurrentKey,
    rotateKey,
    resetErrors,
    getKeyInfo
  };
};
