import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToScanHistory, getScanHistory, clearScanHistory } from '../scanHistory';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('scanHistory service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds new scan to history', async () => {
    const mockExistingHistory: Array<{ id: string; type: 'profile'; timestamp: number; data: { name?: string; email?: string } }> = [];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockExistingHistory));

    const newScan = {
      id: 'test-1',
      type: 'profile' as const,
      data: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    await addToScanHistory(newScan);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@digidex:scan_history',
      expect.stringContaining('"id":"test-1"')
    );
  });

  it('limits history to 50 items', async () => {
    const mockHistory = Array.from({ length: 51 }, (_, i) => ({
      id: `test-${i}`,
      type: 'profile' as const,
      timestamp: Date.now() - i * 1000,
      data: { name: `User ${i}` }
    }));

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistory));

    const newScan = {
      id: 'new-scan',
      type: 'profile' as const,
      data: { name: 'New User' }
    };

    await addToScanHistory(newScan);

    const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const savedHistory = JSON.parse(setItemCall);
    
    expect(savedHistory.length).toBe(50);
    expect(savedHistory[0].id).toBe('new-scan');
  });

  it('retrieves scan history', async () => {
    const mockHistory = [{
      id: 'test-1',
      type: 'profile',
      timestamp: Date.now(),
      data: { name: 'Test User' }
    }];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistory));

    const history = await getScanHistory();
    expect(history).toEqual(mockHistory);
  });

  it('returns empty array when no history exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const history = await getScanHistory();
    expect(history).toEqual([]);
  });

  it('clears scan history', async () => {
    await clearScanHistory();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@digidex:scan_history');
  });

  it('handles storage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const history = await getScanHistory();
    expect(history).toEqual([]);
  });
});
