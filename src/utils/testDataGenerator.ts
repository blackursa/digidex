import type { ScanHistoryItem } from '../types/qrcode';

export function generateTestScanHistory(count: number, options: {
  startDate?: Date;
  endDate?: Date;
  batchPercentage?: number;
} = {}): ScanHistoryItem[] {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    batchPercentage = 20
  } = options;

  const history: ScanHistoryItem[] = [];
  const timeRange = endDate.getTime() - startDate.getTime();
  let currentBatchId: string | null = null;

  for (let i = 0; i < count; i++) {
    const timestamp = startDate.getTime() + Math.random() * timeRange;
    const isBatchScan = Math.random() < (batchPercentage / 100);
    
    if (isBatchScan && !currentBatchId) {
      currentBatchId = `batch-${Math.random().toString(36).substring(7)}`;
    } else if (!isBatchScan) {
      currentBatchId = null;
    }

    history.push({
      id: `scan-${i}`,
      timestamp,
      data: {
        id: `profile-${Math.floor(Math.random() * 100)}`,
        type: 'profile'
      },
      metadata: {
        timestamp,
        batchId: currentBatchId || undefined
      }
    });
  }

  return history.sort((a, b) => a.timestamp - b.timestamp);
}

export function generatePerformanceTestCases(): Array<{
  name: string;
  count: number;
  options?: Parameters<typeof generateTestScanHistory>[1];
}> {
  return [
    { name: 'Small dataset', count: 100 },
    { name: 'Medium dataset', count: 1000 },
    { name: 'Large dataset', count: 5000 },
    { 
      name: 'Recent heavy dataset',
      count: 1000,
      options: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        batchPercentage: 40
      }
    },
    {
      name: 'Sparse historical dataset',
      count: 1000,
      options: {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        batchPercentage: 10
      }
    }
  ];
}
