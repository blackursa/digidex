import AsyncStorage from '@react-native-async-storage/async-storage';

const SCAN_HISTORY_KEY = '@digidex:scan_history';

export interface ScanRecord {
  id: string;
  type: 'profile' | 'contact';
  timestamp: number;
  data: {
    name?: string;
    email?: string;
  };
}

export const addToScanHistory = async (record: Omit<ScanRecord, 'timestamp'>) => {
  try {
    const history = await getScanHistory();
    const newRecord = { ...record, timestamp: Date.now() };
    const updatedHistory = [newRecord, ...history].slice(0, 50); // Keep last 50 scans
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error saving scan history:', error);
    return false;
  }
};

export const getScanHistory = async (): Promise<ScanRecord[]> => {
  try {
    const history = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading scan history:', error);
    return [];
  }
};

export const clearScanHistory = async () => {
  try {
    await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing scan history:', error);
    return false;
  }
};
