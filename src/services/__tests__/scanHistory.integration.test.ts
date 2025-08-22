import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToScanHistory, getScanHistory, clearScanHistory } from '../scanHistory';
import type { ScanRecord } from '../scanHistory';

describe('Scan History Integration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('handles storage errors gracefully', async () => {
    // Mock storage error
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));

    const result = await addToScanHistory({
      id: 'test-1',
      type: 'profile',
      data: { name: 'Test User' }
    });

    expect(result).toBe(false);
    const history = await getScanHistory();
    expect(history).toEqual([]);
  });

  it('maintains data consistency across operations', async () => {
    const scan1: Omit<ScanRecord, 'timestamp'> = {
      id: 'test-1',
      type: 'profile',
      data: { name: 'User 1' }
    };

    const scan2: Omit<ScanRecord, 'timestamp'> = {
      id: 'test-2',
      type: 'profile',
      data: { name: 'User 2' }
    };

    // Add scans
    await addToScanHistory(scan1);
    await addToScanHistory(scan2);

    // Verify order (newest first)
    const history = await getScanHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe('test-2');
    expect(history[1].id).toBe('test-1');

    // Clear history
    await clearScanHistory();
    const emptyHistory = await getScanHistory();
    expect(emptyHistory).toHaveLength(0);
  });

  it('handles concurrent operations correctly', async () => {
    const operations = Array.from({ length: 5 }, (_, i) => ({
      id: `test-${i}`,
      type: 'profile' as const,
      data: { name: `User ${i}` }
    }));

    // Add scans concurrently
    await Promise.all(operations.map(scan => addToScanHistory(scan)));

    const history = await getScanHistory();
    expect(history).toHaveLength(5);
    
    // Verify all scans were saved
    const savedIds = history.map(scan => scan.id);
    operations.forEach(op => {
      expect(savedIds).toContain(op.id);
    });
  });

  it('recovers from corrupted storage data', async () => {
    // Set corrupted data
    await AsyncStorage.setItem('@digidex:scan_history', 'invalid-json');

    const history = await getScanHistory();
    expect(history).toEqual([]);

    // Should be able to add new scans
    const newScan = {
      id: 'test-1',
      type: 'profile' as const,
      data: { name: 'Test User' }
    };

    const result = await addToScanHistory(newScan);
    expect(result).toBe(true);

    const updatedHistory = await getScanHistory();
    expect(updatedHistory).toHaveLength(1);
    expect(updatedHistory[0].id).toBe('test-1');
  });
});
