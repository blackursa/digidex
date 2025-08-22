import React, { useState, useEffect, useCallback, type ReactElement } from 'react';
import { StyleSheet, View, Alert, Text, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { QRScanner } from '../components/QRScanner';
import { parseQRCode } from '../services/qrcode';
import { useScanHistory } from '../hooks/useScanHistory';
import { useBatchScan } from '../hooks/useBatchScan';
import { BatchScanOverlay } from '../components/BatchScanOverlay';
import { getUserProfile, createContactRequest } from '../services/firestore';
import { isScanningAvailable } from '../utils/qrScanner';
import { triggerHaptic } from '../utils/haptics';
import { useLoading } from '../hooks/useLoading';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useAuth } from '../contexts/AuthContext';
import type { NavigationProps } from '../types/navigation';
import { QRScanError } from '../utils/errors';
import { withRetry, OfflineQueue, QueuedOperation } from '../utils/retry';
import NetInfo from '@react-native-community/netinfo';
import type { QRCodeData, QRScanErrorCode } from '../types/qrcode';
import type { UserProfile } from '../types/profile';
import { ScanCache } from '../utils/cache';


interface QRScannerScreenProps {
  onClose?: () => void;
}

export function QRScannerScreen({ onClose }: QRScannerScreenProps): ReactElement {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const { addToHistory } = useScanHistory();
  const batchScan = useBatchScan();

  const [scanStatus, setScanStatus] = useState<'scanning' | 'success' | 'error' | 'retry'>('scanning');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  useEffect(() => {
    // Announce screen purpose to screen readers
    AccessibilityInfo.announceForAccessibility('QR code scanner ready. Point your camera at a QR code to scan.');
    return () => {
      // Cleanup any pending operations
      setError(null);
    };
  }, []);

  const handleError = useCallback(async (err: Error | unknown, data: string) => {
    setError(err instanceof Error ? err : new Error(String(err)));
    console.error('Scan error:', err);
    if (err instanceof QRScanError) {
      AccessibilityInfo.announceForAccessibility(err.getAccessibilityMessage());

      if (err.canRetry()) {
        try {
          const recovered = await err.recoverFromError();
          if (recovered) {
            err.incrementRetry();
            // Retry scan
            handleScan(data);
            return;
          }
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError);
        }
      }
    }
  }, [navigation, onClose]);


  const handleBatchFinish = useCallback(async () => {
    const scannedItems = batchScan.finishBatchScan();
    for (const item of scannedItems) {
      await addToHistory(item);
    }
    navigation.navigate('ScanHistory');
  }, [batchScan, addToHistory, navigation]);

  const handleHistoryPress = useCallback(() => {
    navigation.navigate('ScanHistory');
  }, [navigation]);

  const handleSuccess = useCallback(async (profile: UserProfile, qrData: QRCodeData) => {
    await addToHistory(qrData);
    Alert.alert(
      'Add Contact',
      `Would you like to send a contact request to ${profile.displayName || profile.email}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              await createContactRequest(user.uid, profile.uid);
            } catch (error) {
              handleError(error, qrData.id);
            }
          },
        },
      ]
    );
  }, [user, addToHistory]);

  const showSuccessAlert = useCallback((message: string) => {
    setScanStatus('success');
    triggerHaptic('success');
    AccessibilityInfo.announceForAccessibility('Success! ' + message);
    Alert.alert('Success', message, [
      {
        text: 'OK',
        onPress: () => {
          onClose?.() || navigation.goBack();
        },
      },
    ]);
  }, [navigation, onClose]);

  const handleScan = useCallback(async (data: string) => {
    const offlineQueue = OfflineQueue.getInstance();
    const scanCache = ScanCache.getInstance();
    try {
      setLoadingMessage('Processing QR code...');
      // Try to get from cache first
      let qrData: QRCodeData | null = null;
      try {
        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected && networkState.type !== 'unknown') {
          throw new QRScanError('expired_qr');
        }
        const result = parseQRCode(data);
        if (result) {
          qrData = result;
          // Cache successful parse
          await scanCache.cacheQRData(result);
        }
      } catch (parseError) {
        // If parse fails, try cache
        const cachedData = await scanCache.getCachedQRData(data);
        if (cachedData) {
          qrData = cachedData;
          setScanStatus('retry');
          AccessibilityInfo.announceForAccessibility('Using cached data');
        }
      }

      if (!qrData) {
        try {
          // If both parse and cache fail, retry with backoff
          qrData = await withRetry(async () => {
            try {
              const result = parseQRCode(data);
              if (!result) throw new QRScanError('invalid_qr');
              // Cache successful retry
              await scanCache.cacheQRData(result);
              return result;
            } catch (error) {
              console.error('Parse failed:', error);
              throw error;
            }
          }, {
            maxAttempts: 3,
            onRetry: (attempt, delay) => {
              setScanStatus('retry');
              AccessibilityInfo.announceForAccessibility(`Retrying scan attempt ${attempt}`);
            }
          });
        } catch (error) {
          console.error('Retry failed:', error);
          throw error;
        }
      }

      if (batchScan.isActive) {
        batchScan.addScan(qrData);
        setScanStatus('success');
        return;
      }

      if (qrData.type !== 'profile') {
        throw new QRScanError('unsupported_type');
      }

      if (qrData.id === user?.uid) {
        throw new QRScanError('self_scan');
      }

      await triggerHaptic('impact');

      const profile = await getUserProfile(qrData.id);
      if (!profile) {
        throw new QRScanError('profile_not_found');
      }
      const userProfile: UserProfile = {
        uid: profile.id,
        email: profile.email || '',
        displayName: profile.displayName || '',
        photoURL: profile.photoURL || '',
        company: profile.company || '',
        title: profile.title || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        website: profile.website || '',
        socialLinks: profile.socialLinks || {},
        qrCode: profile.qrCode,
        settings: profile.settings || {},
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: profile.updatedAt || new Date().toISOString()
      };

      // Save to scan history
      await handleSuccess(userProfile, qrData);
    } catch (error) {
      let errorToHandle = error instanceof Error ? error : new QRScanError('request_failed');
      if (!(errorToHandle instanceof Error)) {
        console.error('Unknown error:', errorToHandle);
        errorToHandle = new QRScanError('request_failed');
      }
      await handleError(errorToHandle, data);
    } finally {
      setLoadingMessage('');
    }
  }, [user, handleSuccess, handleError]);

  if (!isScanningAvailable()) {
    return (
      <View style={styles.container}>
        <LoadingOverlay
          message="Camera scanning is not available on this device."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QRScanner 
        onScan={handleScan} 
        onClose={navigation.goBack}
        onHistoryPress={handleHistoryPress}
        onBatchPress={batchScan.startBatchScan}
      />
      {batchScan.isActive && (
        <BatchScanOverlay
          count={batchScan.scannedCount}
          onFinish={handleBatchFinish}
          onCancel={batchScan.cancelBatchScan}
        />
      )}
      {scanStatus !== 'scanning' && (
        <View style={styles.statusOverlay}>
          <Text style={[styles.statusText, scanStatus === 'error' && styles.errorText]}>
            {scanStatus === 'success' ? 'Scan successful' : scanStatus === 'error' ? 'Scan failed' : 'Retrying...'}
          </Text>
        </View>
      )}
      {(isLoading || error) && (
        <LoadingOverlay
          message={loadingMessage}
          error={error?.message}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statusOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
