import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

export function useLoading(initialMessage: string | null = null) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    message: initialMessage,
  });

  const startLoading = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      message: message || prev.message,
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      message: null,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      message: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    try {
      startLoading(loadingMessage);
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    clearError,
    withLoading,
  };
}
