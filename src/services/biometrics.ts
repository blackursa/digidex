import { Platform } from 'react-native';

// Only import LocalAuthentication for mobile platforms
let LocalAuthentication: any;
if (Platform.OS !== 'web') {
  LocalAuthentication = require('expo-local-authentication');
}
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRICS_ENABLED_KEY = '@digidex:biometrics_enabled';
const BIOMETRICS_CREDENTIALS_KEY = '@digidex:biometrics_credentials';

export interface StoredCredentials {
  email: string;
  password: string;
}

export const isBiometricsAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const getBiometricsSupportType = async (): Promise<string> => {
  if (Platform.OS === 'web') return 'None';
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  }
  return 'Biometrics';
};

export const authenticateWithBiometrics = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign in',
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

export const enableBiometrics = async (credentials: StoredCredentials): Promise<boolean> => {
  try {
    const isAvailable = await isBiometricsAvailable();
    if (!isAvailable) {
      return false;
    }

    await AsyncStorage.setItem(BIOMETRICS_ENABLED_KEY, 'true');
    await AsyncStorage.setItem(
      BIOMETRICS_CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );
    return true;
  } catch (error) {
    console.error('Error enabling biometrics:', error);
    return false;
  }
};

export const disableBiometrics = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      BIOMETRICS_ENABLED_KEY,
      BIOMETRICS_CREDENTIALS_KEY,
    ]);
  } catch (error) {
    console.error('Error disabling biometrics:', error);
  }
};

export const isBiometricsEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRICS_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometrics status:', error);
    return false;
  }
};

export const getStoredCredentials = async (): Promise<StoredCredentials | null> => {
  try {
    const credentialsString = await AsyncStorage.getItem(
      BIOMETRICS_CREDENTIALS_KEY
    );
    return credentialsString ? JSON.parse(credentialsString) : null;
  } catch (error) {
    console.error('Error getting stored credentials:', error);
    return null;
  }
};
