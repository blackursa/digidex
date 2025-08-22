import { useCallback, useRef } from 'react';
import type { QRCodeData, ScanHistoryItem } from '../types/qrcode';

interface CacheEntry {
  data: Array<ScanHistoryItem>;
  timestamp: number;
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function useScanHistoryCache() {
  const cache = useRef<CacheEntry | null>(null);

  const getCachedHistory = useCallback((): Array<ScanHistoryItem> | null => {
    if (!cache.current) return null;
    
    const now = Date.now();
    if (now - cache.current.timestamp > CACHE_EXPIRY_MS) {
      cache.current = null;
      return null;
    }
    
    return cache.current.data;
  }, []);

  const setCachedHistory = useCallback((data: Array<ScanHistoryItem>) => {
    cache.current = {
      data,
      timestamp: Date.now(),
    };
  }, []);

  const invalidateCache = useCallback(() => {
    cache.current = null;
  }, []);

  return {
    getCachedHistory,
    setCachedHistory,
    invalidateCache,
  };
}
