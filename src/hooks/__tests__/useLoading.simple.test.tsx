import { renderHook, act } from '@testing-library/react-hooks';
import { useLoading } from '../useLoading';

describe('useLoading', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useLoading());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.message).toBeNull();
  });

  it('handles loading state during async operation', async () => {
    const { result } = renderHook(() => useLoading());
    
    const asyncOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'success';
    };

    let operationResult;
    act(() => {
      result.current.withLoading(async () => {
        operationResult = await asyncOperation();
      }, 'Loading...');
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.message).toBe('Loading...');

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
    expect(operationResult).toBe('success');
  });

  it('handles errors during async operation', async () => {
    const { result } = renderHook(() => useLoading());
    
    const failingOperation = async () => {
      throw new Error('Test error');
    };

    await act(async () => {
      try {
        await result.current.withLoading(failingOperation, 'Loading...');
      } catch (error) {
        // Error is expected
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Test error');
  });

  it('clears error when setError is called with null', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('updates message when setMessage is called', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.setMessage('New message');
    });

    expect(result.current.message).toBe('New message');
  });
});
