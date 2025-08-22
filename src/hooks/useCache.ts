import { useEffect, useState, useCallback } from 'react';
import { ScanCache } from '../utils/cache';

export function useCache() {
  const [cacheSize, setCacheSize] = useState(0);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);

  const updateCacheStats = useCallback(async () => {
    const cache = ScanCache.getInstance();
    const size = await cache.getCacheSize();
    setCacheSize(size);
  }, []);

  const cleanupCache = useCallback(async () => {
    const cache = ScanCache.getInstance();
    await cache.clearExpiredEntries();
    setLastCleanup(new Date());
    await updateCacheStats();
  }, [updateCacheStats]);

  useEffect(() => {
    updateCacheStats();
    // Run cleanup every hour
    const cleanupInterval = setInterval(cleanupCache, 60 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, [cleanupCache, updateCacheStats]);

  return {
    cacheSize,
    lastCleanup,
    cleanupCache,
    updateCacheStats
  };
}
