import { useState, useCallback, useEffect } from 'react';
import type { QRCodeData, ScanHistoryItem } from '../types/qrcode';
import { loadScanHistory, saveScanHistory, mergeScanHistory } from '../services/storage';
import { useScanHistoryCache } from './useScanHistoryCache';

const PAGE_SIZE = 20;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useScanHistory() {
  const { getCachedHistory, setCachedHistory, invalidateCache } = useScanHistoryCache();
  const [history, setHistory] = useState<Array<ScanHistoryItem>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const syncWithRemote = useCallback(async () => {
    try {
      const { history: localHistory, lastSync } = await loadScanHistory();
      
      // TODO: Implement remote sync when backend is ready
      // const remoteHistory = await fetchRemoteHistory(lastSync);
      // const mergedHistory = await mergeScanHistory(localHistory, remoteHistory);
      // await saveScanHistory(mergedHistory);
      
      return localHistory;
    } catch (error) {
      console.error('Failed to sync history:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const syncInterval = setInterval(syncWithRemote, SYNC_INTERVAL);
    return () => clearInterval(syncInterval);
  }, [syncWithRemote]);

  const loadHistory = useCallback(async (page: number = 0, forceRefresh = false) => {
    try {
      setIsLoading(true);
      let data: Array<ScanHistoryItem> = [];
      if (!forceRefresh) {
        const cached = getCachedHistory();
        if (cached) {
          data = cached;
        }
      }
      if (data.length === 0) {
        const { history: storedHistory } = await loadScanHistory();
        data = storedHistory;
        setCachedHistory(data);
      }
      
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageData = data.slice(start, end);
      
      if (page === 0) {
        setHistory(pageData);
      } else {
        setHistory(prev => [...prev, ...pageData]);
      }
      
      setHasMore(end < data.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load scan history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadHistory(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, loadHistory]);

  const addToHistory = useCallback(async (data: QRCodeData) => {
    try {
      const { history: currentHistory } = await loadScanHistory();
      
      const newHistory: ScanHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data,
        metadata: {
          timestamp: Date.now(),
          batchId: data.metadata?.batchId
        }
      };
      
      const updatedHistory = [newHistory, ...currentHistory];
      await saveScanHistory(updatedHistory);
      
      // Refresh first page
      loadHistory(0);
    } catch (error) {
      console.error('Failed to add to scan history:', error);
    }
  }, [loadHistory]);

  return {
    history,
    isLoading,
    hasMore,
    loadHistory,
    loadMore,
    addToHistory,
  };
}
