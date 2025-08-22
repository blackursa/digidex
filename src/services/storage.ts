import { getStorage, ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { manipulateAsync } from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScanHistoryItem } from '../types/qrcode';

const storage = getStorage();

const SCAN_HISTORY_KEY = '@digidex/scan_history';
const LAST_SYNC_KEY = '@digidex/last_sync';

export async function saveScanHistory(history: ScanHistoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history));
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving scan history:', error);
    throw new Error('Failed to save scan history');
  }
}

export async function loadScanHistory(): Promise<{ history: ScanHistoryItem[]; lastSync: number }> {
  try {
    const [historyStr, lastSyncStr] = await Promise.all([
      AsyncStorage.getItem(SCAN_HISTORY_KEY),
      AsyncStorage.getItem(LAST_SYNC_KEY)
    ]);

    return {
      history: historyStr ? JSON.parse(historyStr) : [],
      lastSync: lastSyncStr ? parseInt(lastSyncStr, 10) : 0
    };
  } catch (error) {
    console.error('Error loading scan history:', error);
    return { history: [], lastSync: 0 };
  }
}

export async function mergeScanHistory(
  localHistory: ScanHistoryItem[],
  remoteHistory: ScanHistoryItem[]
): Promise<ScanHistoryItem[]> {
  const mergedMap = new Map<string, ScanHistoryItem>();
  
  // Add all local items
  localHistory.forEach(item => mergedMap.set(item.id, item));
  
  // Add or update with remote items
  remoteHistory.forEach(item => {
    const existing = mergedMap.get(item.id);
    if (!existing || existing.metadata.timestamp < item.metadata.timestamp) {
      mergedMap.set(item.id, item);
    }
  });
  
  return Array.from(mergedMap.values());
}

export async function uploadProfileImage(
  userId: string,
  uri: string
): Promise<string> {
  try {
    // Resize and compress image
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 500, height: 500 } }],
      { compress: 0.7, format: 'jpeg' }
    );

    // Convert image to blob
    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();

    // Create file reference
    const storageRef = ref(storage, `profiles/${userId}/profile-image.jpg`);
    
    // Upload file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
}
