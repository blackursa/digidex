import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from '@firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '../contexts/ToastContext';
import { LoadingState } from '../components/LoadingState';
import { Contact } from '../types/contact';

export const ScanQRScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    try {
      setScanned(true);
      setLoading(true);

      // Validate QR code format
      const [userId, qrCode] = data.split('_');
      if (!userId || !qrCode) {
        throw new Error('Invalid QR code format');
      }

      // Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as Contact;
      
      // Navigate to contact confirmation screen
      navigation.navigate('AddContact', {
        contact: {
          ...userData,
          id: userDoc.id,
        },
      });

      showToast('Contact found! Review details to add.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to scan QR code',
        'error'
      );
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Text>Please enable camera access in your device settings to scan QR codes.</Text>
      </View>
    );
  }

  if (loading) {
    return <LoadingState message="Processing QR code..." />;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        testID="qr-scanner"
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>
      <Text style={styles.instructions}>
        Position the QR code within the frame to scan
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  instructions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
  },
});
