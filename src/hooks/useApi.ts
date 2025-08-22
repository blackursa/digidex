import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions<T> {
  showErrorAlert?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onMount?: boolean;
  params?: any[];
}

export function useApi<T, P extends any[] = any[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showErrorAlert = true, onSuccess, onError, onMount = false, params = [] } = options;

  const execute = useCallback(
    async (...args: P) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (error: any) {
        const errorObj = error instanceof Error ? error : new Error(error.message);
        setState((prev) => ({ ...prev, loading: false, error: errorObj }));
        
        if (showErrorAlert) {
          Alert.alert('Error', errorObj.message);
        }
        
        onError?.(errorObj);
        throw errorObj;
      }
    },
    [apiFunction, showErrorAlert, onSuccess, onError]
  );

  useEffect(() => {
    if (onMount) {
      execute(...(params as P));
    }
  }, [execute, onMount, ...params]);

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({ data: null, loading: false, error: null });
    }, []),
  };
}

// Example usage:
// const { data: contacts, loading, error, execute: fetchContacts } = useApi(getContacts);
// useEffect(() => { fetchContacts(userId); }, []);
