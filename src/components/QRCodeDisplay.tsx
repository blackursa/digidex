import * as React from 'react';
import type { ViewStyle } from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import type { View as RNView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';

interface QRCodeDisplayProps {
  qrData: string;
  title?: string;
  subtitle?: string;
  onShare?: (uri: string) => Promise<void>;
  onError?: (error: string) => void;
  showShareButton?: boolean;
  isLoading?: boolean;
  size?: number;
}

export const QRCodeDisplay = React.memo<QRCodeDisplayProps>(({
  qrData,
  title,
  subtitle,
  onShare,
  onError,
  showShareButton = true,
  isLoading = false,
  size = 200,
}) => {

  const qrRef = React.useRef<RNView>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [isSharing, setIsSharing] = React.useState(false);
  const [scale] = React.useState(new Animated.Value(1));
  const [errorState, setErrorState] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!qrData && onError) {
      onError('Invalid QR code data');
      setErrorState('Invalid QR code data');
    } else {
      setErrorState(null);
    }
  }, [qrData, onError]);

  const handleShare = async () => {
    if (!qrRef.current || !onShare) return;

    try {
      setIsSharing(true);
      await triggerHaptic('impact');

      const uri = await captureRef(qrRef.current, {
        format: 'png',
        quality: 1,
      });

      await onShare(uri);
      AccessibilityInfo.announceForAccessibility('QR code shared successfully');
    } catch (error) {
      console.error('Error sharing QR code:', error);
      if (onError) {
        onError('Failed to share QR code');
        await triggerHaptic('error');
        AccessibilityInfo.announceForAccessibility('Failed to share QR code. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const animateQRCode = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {isLoading ? (
        <ActivityIndicator
          testID="qr-loading-indicator"
          size="large"
          color="#007AFF"
          style={styles.loader}
        />
      ) : errorState ? (
        <Text style={styles.errorText}>{errorState}</Text>
      ) : (
        <View
          ref={qrRef}
          testID="qr-code-container"
          accessibilityRole="image"
          accessibilityLabel={`QR code for ${title || 'sharing'}`}
          accessibilityHint={showShareButton ? 'Contains your profile information for sharing' : 'Contains your profile information'}
          style={[styles.qrContainer, { width: size, height: size }]}
        >
          <QRCode
            value={qrData}
            size={size - 40} // Account for padding
            backgroundColor="white"
            color="black"
          />
        </View>
      )}

      {showShareButton && !errorState && (
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={isSharing}
          accessibilityRole="button"
          accessibilityLabel="Share QR Code"
          accessibilityHint="Share your QR code with others"
        >
          {isSharing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <React.Fragment>
              <Ionicons name="share-outline" size={24} color="#fff" />
              <Text style={styles.shareButtonText}>Share QR Code</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
