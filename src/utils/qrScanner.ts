import { Alert } from 'react-native';

// Define types we need even if modules aren't available
type CameraPermissionResponse = { status: 'granted' | 'denied' };
type BarCodeType = { qr: string };
type CameraType = { back: 'back'; front: 'front' };
type FlashMode = { off: 'off'; on: 'on'; torch: 'torch' };

interface CameraInterface {
  Camera: React.ComponentType<{
    style: any;
    type: 'front' | 'back';
    flashMode?: 'off' | 'on' | 'torch';
    children?: React.ReactNode;
  }>;
  requestCameraPermissionsAsync: () => Promise<CameraPermissionResponse>;
  Constants: {
    Type: CameraType;
    FlashMode: FlashMode;
  };
}

// Safely try to get Camera module
let Camera: CameraInterface | null = null;
try {
  const ExpoCamera = require('expo-camera');
  Camera = ExpoCamera;
} catch (error) {
  console.warn('Camera module not available:', error);
}

// Safely try to get BarCodeScanner module
let BarCodeScanner: { Constants: { BarCodeType: BarCodeType } } | null = null;
try {
  const Scanner = require('expo-barcode-scanner');
  BarCodeScanner = Scanner;
} catch (error) {
  console.warn('Barcode scanner not available:', error);
}

export const requestCameraPermissions = async () => {
  if (!Camera) {
    Alert.alert(
      'Camera Not Available',
      'The camera module is not available on this device.'
    );
    return false;
  }

  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    const granted = status === 'granted';
    
    if (!granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to scan QR codes.'
      );
    }
    
    return granted;
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    Alert.alert(
      'Permission Error',
      'Failed to request camera permissions.'
    );
    return false;
  }
};

export const getBarCodeTypes = () => {
  if (!BarCodeScanner?.Constants?.BarCodeType?.qr) {
    return [];
  }
  return [BarCodeScanner.Constants.BarCodeType.qr];
};

export const isScanningAvailable = () => {
  return !!(Camera && BarCodeScanner?.Constants?.BarCodeType?.qr);
};

export const getCameraModule = () => Camera;
export const getBarCodeScannerModule = () => BarCodeScanner;
