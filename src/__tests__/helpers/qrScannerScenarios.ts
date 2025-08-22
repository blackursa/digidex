import { UserProfile } from '../../types/index';

export interface QRScannerTestData {
  qrData: string;
  profile?: UserProfile;
  error?: Error;
}

export const mockProfiles = {
  valid: {
    id: 'test-profile-id',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
    bio: 'Test bio',
  },
  invalid: {
    id: 'invalid-id',
    displayName: '',
    email: '',
  },
  self: {
    id: 'self-profile-id',
    displayName: 'Current User',
    email: 'current@example.com',
  },
};

export const qrScannerScenarios = {
  validScan: {
    qrData: JSON.stringify({
      type: 'profile',
      id: mockProfiles.valid.id,
      timestamp: Date.now(),
    }),
    profile: mockProfiles.valid,
  },
  invalidFormat: {
    qrData: 'invalid-qr-data',
    error: new Error('Invalid QR code format'),
  },
  invalidProfile: {
    qrData: JSON.stringify({
      type: 'profile',
      id: mockProfiles.invalid.id,
      timestamp: Date.now(),
    }),
    profile: mockProfiles.invalid,
    error: new Error('Invalid profile data'),
  },
  selfScan: {
    qrData: JSON.stringify({
      type: 'profile',
      id: mockProfiles.self.id,
      timestamp: Date.now(),
    }),
    profile: mockProfiles.self,
    error: new Error('Cannot scan own QR code'),
  },
  expiredScan: {
    qrData: JSON.stringify({
      type: 'profile',
      id: mockProfiles.valid.id,
      timestamp: Date.now() - 1000 * 60 * 60 * 25, // 25 hours ago
    }),
    profile: mockProfiles.valid,
    error: new Error('QR code has expired'),
  },
  networkError: {
    qrData: JSON.stringify({
      type: 'profile',
      id: mockProfiles.valid.id,
      timestamp: Date.now(),
    }),
    profile: mockProfiles.valid,
    error: new Error('Network error'),
  },
};

export const mockScannerEvents = {
  success: (data: string) => ({
    type: 'qr',
    data,
  }),
  error: (message: string) => new Error(message),
  cancel: () => undefined,
};

export const accessibilityMessages = {
  scanStart: 'Point your camera at a QR code to scan',
  scanDetected: 'QR code detected. Processing scan.',
  scanSuccess: (name: string) => `Found profile for ${name}. Would you like to send a contact request?`,
  scanError: 'Error scanning QR code. Please try again.',
  scanCancelled: 'Scanning cancelled',
  requestSent: 'Contact request sent successfully',
  requestError: 'Failed to send contact request. Please try again.',
  cameraError: 'Error accessing camera. Please try again.',
};
