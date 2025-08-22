import { useState, useCallback } from 'react';
import { QRCodeData } from '../types/qrcode';

interface BatchScanState {
  isActive: boolean;
  scannedItems: QRCodeData[];
}

export function useBatchScan() {
  const [state, setState] = useState<BatchScanState>({
    isActive: false,
    scannedItems: [],
  });

  const startBatchScan = useCallback(() => {
    setState({
      isActive: true,
      scannedItems: [],
    });
  }, []);

  const addScan = useCallback((data: QRCodeData) => {
    setState(prev => ({
      ...prev,
      scannedItems: [...prev.scannedItems, data],
    }));
  }, []);

  const finishBatchScan = useCallback(() => {
    setState(prev => ({
      isActive: false,
      scannedItems: [],
    }));
    return state.scannedItems;
  }, [state.scannedItems]);

  const cancelBatchScan = useCallback(() => {
    setState({
      isActive: false,
      scannedItems: [],
    });
  }, []);

  return {
    isActive: state.isActive,
    scannedCount: state.scannedItems.length,
    scannedItems: state.scannedItems,
    startBatchScan,
    addScan,
    finishBatchScan,
    cancelBatchScan,
  };
}
