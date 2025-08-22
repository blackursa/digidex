import { type FC, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, Share, ActivityIndicator, AccessibilityInfo } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { generateQRCode, type QRCodeData } from '../services/qrcode';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { triggerHaptic } from '../utils/haptics';
import { useLoading } from '../hooks/useLoading';
import { LoadingOverlay } from '../components/LoadingOverlay';

interface ShareError extends Error {
  code: 'generate_failed' | 'share_failed' | 'not_authenticated';
}

interface ShareProfileScreenProps {
  onClose?: () => void;
}

export const ShareProfileScreen: FC<ShareProfileScreenProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { isLoading, error, message, withLoading, setError } = useLoading();
  
  useEffect(() => {
    // Announce screen purpose to screen readers
    AccessibilityInfo.announceForAccessibility(
      'Share profile screen. Your QR code is ready to be shared.'
    );
    return () => {
      // Cleanup any pending operations
      setError('');
    };
  }, [setError]);

  const handleShare = useCallback(async (uri: string): Promise<void> => {
    await withLoading(async () => {
      try {
        await triggerHaptic('impact');
        await Share.share({
          url: uri,
          message: 'Scan this QR code to add me as a contact!'
        });
        await triggerHaptic('success');
      } catch (error) {
        console.error('Share error:', error);
        await triggerHaptic('error');
        const shareError = new Error('Failed to share QR code') as ShareError;
        shareError.code = 'share_failed';
        throw shareError;
      }
    }, 'Preparing to share...');
  }, [withLoading]);

  // Early return if no user
  if (!user) {
    const authError = new Error('Please sign in to share your profile') as ShareError;
    authError.code = 'not_authenticated';
    AccessibilityInfo.announceForAccessibility('Authentication required. Please sign in to share your profile.');
    return (
      <View style={styles.container}>
        <LoadingOverlay
          error="Please sign in to share your profile"
        />
      </View>
    );
  }

  // Generate QR code
  let qrData: string;
  try {
    qrData = generateQRCode({
      type: 'profile',
      id: user.uid,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // QR code expires in 24 hours
    });
  } catch (error) {
    const genError = new Error('Failed to generate QR code') as ShareError;
    genError.code = 'generate_failed';
    AccessibilityInfo.announceForAccessibility('Error: Failed to generate QR code. Please try again.');
    return (
      <View style={styles.container}>
        <LoadingOverlay
          error={genError.message}
          message="The QR code could not be generated. Please try again."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QRCodeDisplay
        qrData={qrData}
        title="Share Your Profile"
        subtitle="Let others scan this code to add you as a contact"
        onShare={handleShare}
        onError={setError}
      />
      {(isLoading || error) && (
        <LoadingOverlay
          message={message}
          error={error}
        />
      )}
      <View 
        style={styles.info}
        accessible={true}
        accessibilityLabel={`Profile information for ${user.displayName || 'User'}`}
        accessibilityHint="Contains your display name and email address"
      >
        <Text 
          style={styles.name}
          accessibilityRole="header"
        >
          {user.displayName || 'User'}
        </Text>
        <Text 
          style={styles.email}
          accessibilityLabel={`Email: ${user.email}`}
        >
          {user.email}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  info: {
    alignItems: 'center',
    marginTop: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
