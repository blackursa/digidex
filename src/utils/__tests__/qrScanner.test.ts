import { isScanningAvailable, requestCameraPermission } from '../qrScanner';
import * as ExpoCamera from 'expo-camera';
import * as ExpoBarCodeScanner from 'expo-barcode-scanner';

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
  },
}));

jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    requestPermissionsAsync: jest.fn(),
  },
}));

describe('QR Scanner Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isScanningAvailable', () => {
    it('returns true when both camera and barcode scanner are available', () => {
      expect(isScanningAvailable()).toBe(true);
    });

    it('returns false when expo-camera is not available', () => {
      jest.resetModules();
      jest.mock('expo-camera', () => {
        throw new Error('Module not found');
      });
      
      expect(isScanningAvailable()).toBe(false);
    });

    it('returns false when expo-barcode-scanner is not available', () => {
      jest.resetModules();
      jest.mock('expo-barcode-scanner', () => {
        throw new Error('Module not found');
      });
      
      expect(isScanningAvailable()).toBe(false);
    });
  });

  describe('requestCameraPermission', () => {
    it('requests permissions from both camera and barcode scanner', async () => {
      (ExpoCamera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ExpoBarCodeScanner.BarCodeScanner.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

      const result = await requestCameraPermission();
      expect(result).toBe(true);
      expect(ExpoCamera.Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(ExpoBarCodeScanner.BarCodeScanner.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false if camera permission is denied', async () => {
      (ExpoCamera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (ExpoBarCodeScanner.BarCodeScanner.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

      const result = await requestCameraPermission();
      expect(result).toBe(false);
    });

    it('returns false if barcode scanner permission is denied', async () => {
      (ExpoCamera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ExpoBarCodeScanner.BarCodeScanner.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const result = await requestCameraPermission();
      expect(result).toBe(false);
    });

    it('handles permission request errors gracefully', async () => {
      (ExpoCamera.Camera.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Permission error'));
      
      const result = await requestCameraPermission();
      expect(result).toBe(false);
    });

    it('handles missing modules gracefully', async () => {
      jest.resetModules();
      jest.mock('expo-camera', () => {
        throw new Error('Module not found');
      });
      
      const result = await requestCameraPermission();
      expect(result).toBe(false);
    });
  });
});
