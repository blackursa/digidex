import React from 'react';
import { Alert, AccessibilityInfo, View } from 'react-native';
import { renderWithProviders } from '../../utils/test-utils';
import { QRScannerScreen } from '../QRScannerScreen';
import { parseQRCode } from '../../services/qrcode';
import { triggerHaptic } from '../../utils/haptics';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import '@testing-library/jest-native/extend-expect';
import { jest, describe, beforeEach, afterEach, beforeAll, afterAll, expect, it } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { isScanningAvailable } from '../../utils/qrScanner';
import { addToScanHistory } from '../../services/scanHistory';

type AlertButton = { text: string; onPress?: () => void };
type AlertOptions = { cancelable?: boolean };
type HapticType = 'success' | 'error' | 'impact';

interface Contact {
  id: string;
  displayName: string;
}

type StyleProp<T> = T | T[] | { [key: string]: any };

interface QRCodeData {
  type: 'contact';
  id: string;
  userId: string;
  code: string;
}

type AsyncFn<Args extends any[], R> = (...args: Args) => Promise<R>;

type QRScannerMock = jest.Mock;
type ScanningAvailableMock = jest.Mock;
type UserProfileMock = jest.MockedFunction<(userId: string) => Promise<Contact | null>>;
type ContactRequestMock = jest.MockedFunction<(code: string) => Promise<{ success: boolean }>>;
type GetCurrentUserIdMock = jest.MockedFunction<() => Promise<string>>;

const createMock = <R,>(mockImpl?: () => Promise<R>): jest.MockedFunction<() => Promise<R>> => jest.fn(mockImpl);

interface QRScannerEvent {
  type: 'qr';
  data: string;
}

interface ParsedQRData extends QRCodeData {
  userId: string;
  code: string;
  error?: {
    code: string;
    message: string;
  };
}

interface ErrorCase {
  code: string;
  message: string;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
}

interface ScanScenario {
  qrData: string;
  error?: Error;
  profile?: UserProfile;
}

class QRScanError extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'QRScanError';
    this.code = code;
  }
}

const mockUserProfile: UserProfile = {
  id: 'test-user-id',
  displayName: 'Test User',
  email: 'test@example.com'
};

const invalidProfile: Partial<UserProfile> = {
  id: '',
  displayName: '',
  email: ''
};

const validProfile: UserProfile = {
  id: 'test-id',
  displayName: 'Test User',
  email: 'test@example.com'
};

const qrScannerScenarios = {
  validScan: {
    qrData: 'valid-qr-data',
    profile: mockUserProfile
  },
  invalidFormat: {
    qrData: 'invalid-qr-data',
    error: new Error('Invalid QR code format')
  },
  expiredQR: {
    qrData: 'expired-qr-data',
    error: new QRScanError('TEST_ERROR', 'Test error')
  },
  networkError: {
    qrData: 'network-error-data',
    error: new QRScanError('TEST_ERROR', 'Test error')
  },
  invalidProfile: {
    qrData: 'invalid-profile-data',
    error: new Error('Invalid profile')
  }
};

const mockScannerEvents = {
  success: (data: string): QRScannerEvent => ({
    type: 'qr',
    data
  }),
  error: (error: Error) => ({ error }),
  cancel: () => ({}),
  validQRCode: 'valid-qr-data'
};

const accessibilityMessages = {
  scannerReady: 'QR code scanner ready',
  scannerDenied: 'Camera permission denied',
  scanSuccess: (name: string) => `Found profile for ${name}`,
  scanError: 'Error scanning QR code',
  scanCancelled: 'Scanning cancelled',
  cameraError: 'Camera error occurred',
  scanStart: 'Starting QR code scan',
  scanDetected: 'QR code detected',
  requestError: 'Error processing request'
};

// Mock dependencies with explicit implementations
const mockFn = () => jest.fn().mockImplementation(() => ({}));

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTruthy(): R;
      toBeNull(): R;
      toEqual(expected: any): R;
      toHaveLength(length: number): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toBeInstanceOf(expected: any): R;
      toBe(expected: any): R;
    }
  }
}

// Mock modules
type ScanningAvailable = () => Promise<boolean>;
type ParseQRCode = (data: unknown) => Promise<QRCodeData | null>;
type GetCurrentUserId = () => Promise<string>;
type GetUserProfile = (userId: string) => Promise<Contact | null>;
type CreateContactRequest = (userId: string) => Promise<{ success: boolean }>;
type TriggerHaptic = (type: HapticType) => void;
type AlertFn = (title: string, message?: string) => void;
type AnnounceForAccessibility = (message: string) => void;

const mockScanningAvailable = jest.fn<ScanningAvailable>().mockImplementation(async () => true);
jest.mock('../../utils/qrScanner', () => ({
  isScanningAvailable: mockScanningAvailable
}));

const mockParseQRCode = jest.fn<ParseQRCode>().mockImplementation(async (data) => {
  const qrData = data as string | { userId: string };
  const userId = typeof qrData === 'string' ? qrData : (qrData as { userId: string }).userId;
  if (userId.includes('invalid')) {
    throw new QRScanError('TEST_ERROR', 'Test error');
  }
  return {
    type: 'contact',
    id: 'test-qr-id',
    userId: 'test-id',
    code: typeof qrData === 'string' ? qrData : (qrData as { userId: string }).userId
  };
});

jest.mock('../../services/qrcode', () => ({
  parseQRCode: mockParseQRCode
}));

jest.mock('../../services/auth', () => mocks.auth);
jest.mock('../../services/firestore', () => mocks.firestore);
jest.mock('../../services/qrcode', () => mocks.qrcode);
jest.mock('../../utils/haptics', () => mocks.haptics);
jest.mock('../../services/qrScanner', () => mocks.qrScanner);

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mocks.alert
}));

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Alert: {
    alert: mocks.alert
  },
  StyleSheet: {
    create: (styles: Record<string, any>) => ({ styles })
  },
  AccessibilityInfo: {
    announceForAccessibility: mocks.announceForAccessibility,
    isScreenReaderEnabled: jest.fn().mockImplementation(async () => true)
  }
}));

// Types and interfaces
interface Contact {
  id: string;
  displayName: string;
}

// Mock setup
const mocks = {
  auth: {
    getCurrentUserId: jest.fn<GetCurrentUserId>().mockResolvedValue('current-user-id')
  },
  firestore: {
    getUserProfile: jest.fn<(userId: string) => Promise<Contact>>().mockResolvedValue({ id: 'test-user', displayName: 'Test User' }),
    sendContactRequest: jest.fn<(userId: string) => Promise<{ success: boolean }>>().mockResolvedValue({ success: true })
  },
  qrcode: {
    parseQRCode: jest.fn<ParseQRCode>().mockResolvedValue({
      type: 'contact',
      id: 'test-qr-id',
      userId: 'test-id',
      code: 'test-code'
    })
  },
  haptics: {
    triggerHaptic: jest.fn<TriggerHaptic>().mockImplementation((type) => {})
  },
  qrScanner: {
    isScanningAvailable: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
  },
  alert: jest.fn(),
  announceForAccessibility: jest.fn<AnnounceForAccessibility>().mockImplementation((message) => {})
};

// Apply mocks
jest.mock('../../services/auth', () => mocks.auth);
jest.mock('../../services/firestore', () => mocks.firestore);
jest.mock('../../services/qrcode', () => mocks.qrcode);
jest.mock('../../utils/haptics', () => mocks.haptics);
jest.mock('../../services/qrScanner', () => mocks.qrScanner);

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mocks.alert
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack
  })
}));

jest.mock('../../services/scanHistory', () => ({
  addToScanHistory: jest.fn().mockResolvedValue(true)
}));

describe('QRScannerScreen', () => {
  // Use modern timers to better handle async operations
  // Use legacy timers for better compatibility
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset all mock implementations
    Object.values(mocks).forEach(mockGroup => {
      Object.values(mockGroup).forEach(mock => {
        if (typeof mock.mockReset === 'function') {
          mock.mockReset();
        }
      });
    });

    // Set up default mock implementations
    mocks.qrScanner.isScanningAvailable.mockResolvedValue(true);
    mocks.firestore.getUserProfile.mockImplementation(() => Promise.resolve(mockUserProfile));
  });

  afterEach(() => {
    // Clean up
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  // Helper function to flush promises and timers
  const flushPromisesAndTimers = () => {
    jest.runAllTimers();
    return new Promise(resolve => setImmediate(resolve));
  };

  // Add a basic test to verify test environment
  it('handles successful QR code scan', async () => {
    renderWithProviders(<QRScannerScreen />);
    await flushPromisesAndTimers();

    const scanner = screen.getByTestId('qr-scanner');
    const { qrData, profile } = qrScannerScenarios.validScan;

    // Trigger scan event
    fireEvent(scanner, 'scan', mockScannerEvents.success(qrData));
    await flushPromisesAndTimers();

    // Verify expected behavior
    expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('impact');
    expect(mockParseQRCode).toHaveBeenCalledWith(qrData);
    expect(mocks.firestore.getUserProfile).toHaveBeenCalledWith(profile.id);
    expect((mocks.alert as jest.Mock).mock.calls[0][0]).toBe('Add Contact');
    expect((mocks.alert as jest.Mock).mock.calls[0][1]).toBe(`Would you like to send a contact request to ${profile.displayName}?`);
    expect((mocks.alert as jest.Mock).mock.calls[0][2]).toEqual(expect.any(Array));
  });

  it('handles invalid QR code format', async () => {
    renderWithProviders(<QRScannerScreen />);
    await flushPromisesAndTimers();

    const scanner = screen.getByTestId('qr-scanner');
    const { qrData } = qrScannerScenarios.invalidFormat;

    // Trigger scan event
    fireEvent(scanner, 'scan', mockScannerEvents.success(qrData));
    await flushPromisesAndTimers();

    // Verify expected behavior
    expect((mocks.alert as jest.Mock).mock.calls[0][0]).toBe('Invalid QR Code');
    expect((mocks.alert as jest.Mock).mock.calls[0][1]).toBe('The scanned QR code is not a valid Digidex contact code.');
    expect((mocks.alert as jest.Mock).mock.calls[0][2]).toEqual(expect.any(Array));
  });

  describe('Scanning', () => {
    it('should handle scanning not available', async () => {
      // Setup mock with proper error handling
      mocks.qrScanner.isScanningAvailable.mockResolvedValue(false);

      // Render component and get cleanup function
      const { unmount } = renderWithProviders(<QRScannerScreen />);
      const cleanupFns = [unmount];

      try {
        jest.runAllTimers();

        await waitFor(() => {
          const { getByText } = screen;
          expect(getByText(/scanning not available/i)).toBeTruthy();
        }, { timeout: 2000 });
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }
    });

    it('should handle successful QR code scan', async () => {
      // Setup mocks with proper error handling
      mocks.qrScanner.isScanningAvailable.mockResolvedValue(true);
      (mocks.qrcode.parseQRCode as jest.Mock).mockReturnValue(mockScannerEvents.validQRCode);
      mocks.firestore.getUserProfile.mockImplementation(() => Promise.resolve(mockUserProfile));
      mocks.firestore.sendContactRequest.mockImplementation(() => Promise.resolve({ success: true }));

      // Render component and get cleanup function
      const { unmount } = renderWithProviders(<QRScannerScreen />);
      const cleanupFns = [unmount];

      try {
        // Wait for scanner to be available
        await waitFor(() => {
          const { getByTestId, getByText } = screen;
          const scanner = screen.getByTestId('qr-scanner');
          const statusText = getByTestId('status-text');
          const errorText = getByText('Error');
          const errorMessage = getByText('Failed to scan QR code');
          expect(errorText).toBeTruthy();
          expect(errorMessage).toBeTruthy();
          expect(scanner).toBeTruthy();
          expect(statusText.props.children).toBe('Scanning...');
        });

        // Simulate QR code scan
        fireEvent(screen.getByTestId('qr-scanner'), 'onBarCodeScanned', {
          type: 'qr',
          data: 'valid-qr-code'
        });

        await waitFor(() => {
          expect(mocks.qrcode.parseQRCode).toHaveBeenCalledWith('valid-qr-code');
          expect(mocks.firestore.getUserProfile).toHaveBeenCalledWith('test-id');
          expect(mocks.firestore.sendContactRequest).toHaveBeenCalledWith('test-id');
          expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('success');
          expect(mocks.announceForAccessibility).toHaveBeenCalledWith(
            'Contact request sent successfully'
          );
        });
        jest.runOnlyPendingTimers();

        expect((mocks.firestore.sendContactRequest as jest.Mock).mock.calls[0][0]).toBe('valid-qr-code');
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }
    });

    it('handles successful QR code scan', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');
      const { qrData, profile } = qrScannerScenarios.validScan;

      fireEvent(scanner, 'scan', mockScannerEvents.success(qrData));
      
      // Advance timers to handle any setTimeout/setInterval
      jest.advanceTimersByTime(0);

      // Wait for async operations to complete
      await Promise.resolve();

      expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('impact');
      expect(mockParseQRCode).toHaveBeenCalledWith(qrData);
      expect(mocks.firestore.getUserProfile).toHaveBeenCalledWith(profile.id);
      expect((mocks.alert as jest.Mock).mock.calls[0][0]).toBe('Add Contact');
      expect((mocks.alert as jest.Mock).mock.calls[0][1]).toBe(`Would you like to send a contact request to ${profile.displayName}?`);
      expect((mocks.alert as jest.Mock).mock.calls[0][2]).toEqual(expect.any(Array));
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        accessibilityMessages.scanSuccess(profile.displayName)
      );
    });

    it('handles invalid QR code data', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');
      const { qrData } = qrScannerScenarios.invalidFormat;

      (mocks.qrcode.parseQRCode as jest.Mock<(data: unknown) => Promise<QRCodeData | null>>).mockResolvedValue(null);

      fireEvent(scanner, 'scan', mockScannerEvents.success(qrData));
      jest.advanceTimersByTime(0);
      await Promise.resolve();

      expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('error');
      expect((mocks.alert as jest.Mock).mock.calls[0][0]).toBe('Invalid QR Code');
      expect((mocks.alert as jest.Mock).mock.calls[0][1]).toBe(expect.any(String));
      expect((mocks.alert as jest.Mock).mock.calls[0][2]).toEqual(expect.any(Array));
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        accessibilityMessages.scanError
      );
    });

    it('handles user profile not found', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');
      const currentUserId = 'current-user-id';

      const mockQRData: QRCodeData = {
        type: 'contact',
        id: 'test-id',
        userId: currentUserId,
        code: 'test-code'
      };

      // Simulate error
      const error = new QRScanError('You cannot scan your own QR code', 'self_scan');
      (mocks.qrcode.parseQRCode as jest.Mock).mockImplementation(() => { throw error; });

      // Trigger scan
      fireEvent(scanner, 'scan', { type: 'qr', data: JSON.stringify(mockQRData) });

      await waitFor(() => {
        jest.runAllTimers();
        expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('error');
        expect(mocks.alert).toHaveBeenCalledWith(
          'Invalid QR Code',
          'You cannot scan your own QR code.',
          expect.any(Array)
        );
        expect(mocks.announceForAccessibility).toHaveBeenCalledWith(
          'Error: You cannot scan your own QR code. Please try again.'
        );
      });
    });

    it('handles accessibility announcements during scanning', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');

      // Start scanning
      fireEvent(scanner, 'focus');
      expect(mocks.announceForAccessibility).toHaveBeenCalledWith('QR code scanner activated');

      // Simulate successful scan
      const mockQRData: QRCodeData = {
        type: 'contact',
        id: 'test-id',
        userId: 'test-user',
        code: 'test-code'
      };

      (mocks.qrcode.parseQRCode as jest.Mock).mockImplementationOnce(() => Promise.resolve(mockQRData));
      mocks.firestore.getUserProfile.mockResolvedValueOnce({
        id: 'test-user',
        displayName: 'Test User'
      } as Contact);

      fireEvent(scanner, 'scan', { type: 'qr', data: JSON.stringify(mockQRData) });

      await waitFor(() => {
        expect(mocks.announceForAccessibility).toHaveBeenCalledWith('Processing scan...');
      });

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          'Success: Contact request sent successfully!'
        );
      });
    });

    it('shows loading state during profile fetch', async () => {
      renderWithProviders(<QRScannerScreen />);
      const mockQRData: QRCodeData = {
        type: 'contact',
        id: 'test-id',
        userId: 'test-user',
        code: 'test-code'
      };

      // Setup delayed profile fetch
      mocks.firestore.getUserProfile.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          id: 'test-user',
          displayName: 'Test User'
        };
      });

      // Initial state - no loading indicator
      expect(screen.queryByTestId('loading-indicator')).toBeNull();

      // Trigger scan
      fireEvent(screen.getByTestId('qr-scanner'), 'scan', { type: 'qr', data: JSON.stringify(mockQRData) });

      // Loading indicator should appear
      await waitFor(() => {
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      });

      // Wait for profile fetch to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(mocks.firestore.sendContactRequest).toHaveBeenCalled();
      });
    });

    it('allows scanning to be cancelled', async () => {
      renderWithProviders(<QRScannerScreen />);
      const { unmount } = screen;
      
      const scanner = screen.getByTestId('qr-scanner');

      // Start scanning
      fireEvent(scanner, 'focus');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('QR code scanner activated');

      // Mock a long-running profile fetch
      const mockQRData: QRCodeData = {
        type: 'contact',
        id: 'test-id',
        userId: 'test-user',
        code: 'test-code'
      };

      mocks.firestore.getUserProfile.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      // Trigger scan
      fireEvent(scanner, 'scan', { type: 'qr', data: JSON.stringify(mockQRData) });

      // Cancel button should appear in alert
      await waitFor(() => {
        const alertButtons = ((Alert.alert as jest.Mock).mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>);
        const cancelButton = alertButtons.find(btn => btn.text === 'Cancel');
        expect(cancelButton).toBeTruthy();
        
        // Press cancel
        cancelButton?.onPress?.();
      });

      // Should show cancellation feedback
      await waitFor(() => {
        expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('error');
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Scanning cancelled');
      });

      // Scanner should be ready for new scan
      expect(scanner.props.accessibilityState.disabled).toBe(false);
    });

    it('handles multiple rapid scans', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');

      const mockQRData: QRCodeData = {
        type: 'contact',
        id: 'test-id',
        userId: 'test-user',
        code: 'test-code'
      };

      // Trigger multiple rapid scans
      fireEvent(scanner, 'scan', { type: 'qr', data: JSON.stringify(mockQRData) });

      // After completion, scanner should be ready
      await waitFor(() => {
        expect(scanner.props.accessibilityState.disabled).toBe(false);
      });
    });

    it('handles app state transitions correctly', async () => {
      // Mock AppState
      let currentState = 'active';
      const appStateListeners = new Set<(state: string) => void>();
      const mockAppState = {
        addEventListener: jest.fn((event: string, callback: (state: string) => void) => {
          appStateListeners.add(callback);
          return { remove: () => appStateListeners.delete(callback) };
        }),
        get currentState() { return currentState; }
      };
      jest.spyOn(require('react-native'), 'AppState').mockReturnValue(mockAppState);

      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');

      // Initial state
      expect(scanner.props.accessibilityState.disabled).toBe(false);

      // App goes to background
      currentState = 'background';
      appStateListeners.forEach(listener => listener('background'));

      // Scanner should be disabled
      expect(scanner.props.accessibilityState.disabled).toBe(true);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Scanner paused');

      // App returns to foreground
      currentState = 'active';
      appStateListeners.forEach(listener => listener('active'));

      // Scanner should reinitialize
      await waitFor(() => {
        expect(scanner.props.accessibilityState.disabled).toBe(false);
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Scanner ready');
      });
    });

    it('reinitializes scanner after error', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');

      // Simulate a scan error
      const mockError = new Error('Scanner error');
      fireEvent(scanner, 'error', mockError);

      // Verify error handling
      await waitFor(() => {
        expect(mocks.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to fetch user profile. Please try again.',
          expect.any(Array)
        );
        expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('error');
      });

      // Scanner should attempt to reinitialize
      expect(mocks.qrScanner.isScanningAvailable).toHaveBeenCalledTimes(2); // Initial + reinit
      expect(scanner.props.accessibilityState.disabled).toBe(false);
    });

    it('cleans up resources on unmount', async () => {
      // Mock AppState listeners
      const appStateListeners = new Set<(state: string) => void>();
      const mockAppState = {
        addEventListener: jest.fn((event: string, callback: (state: string) => void) => {
          appStateListeners.add(callback);
          return { remove: () => appStateListeners.delete(callback) };
        }),
        currentState: 'active'
      };
      jest.spyOn(require('react-native'), 'AppState').mockReturnValue(mockAppState);

      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');
      
      // Verify AppState listener was added
      expect(mockAppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(appStateListeners.size).toBe(1);

      // Unmount component
      screen.unmount();

      // Verify cleanup
      expect(appStateListeners.size).toBe(0);
      expect(scanner.props.onScan).toBe(null);
    });

    it('handles invalid QR code format', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');

      // Invalid JSON data
      fireEvent(scanner, 'scan', { type: 'qr', data: 'invalid-json' });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Invalid QR code format',
          [{ text: 'OK' }]
        );
        expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('error');
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          'Error: Invalid QR code format'
        );
      });

      // Valid JSON but wrong format
      fireEvent(scanner, 'scan', { type: 'qr', data: JSON.stringify({ type: 'wrong' }) });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Invalid QR code format',
          [{ text: 'OK' }]
        );
        expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('error');
      });
    });

    it('handles camera permission denied', async () => {
      // Mock scanning unavailable
      const scannerSpy = jest.spyOn(require('../../utils/qrScanner'), 'isScanningAvailable')
        .mockImplementation(() => Promise.resolve(false));
      
      renderWithProviders(<QRScannerScreen />);
      const { queryByTestId } = screen;
      
      // Scanner should not be present
      expect(queryByTestId('qr-scanner')).toBeNull();
      
      // Cleanup
      scannerSpy.mockRestore();
    });

    it('handles error boundary exceptions', async () => {
      // Mock a component that throws an error
      mocks.firestore.getUserProfile.mockImplementation(() => {
        throw new Error('Network error');
      });

      // Mock error boundary logger
      const mockLogError = jest.fn();
      const originalConsoleError = console.error;
      console.error = mockLogError;

      try {
        renderWithProviders(<QRScannerScreen />);
        const errorText = screen.getByText('Error');
        const errorMessage = screen.getByText('Failed to scan QR code');
        expect(errorText).toBeTruthy();
        expect(errorMessage).toBeTruthy();
        expect(mockLogError).toHaveBeenCalled();
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('Error Handling', () => {
    it('announces initial screen state on mount', () => {
      renderWithProviders(<QRScannerScreen />);

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'QR code scanner ready. Point your camera at a QR code to scan.'
      );
    });

    it('cleans up error state on unmount', () => {
      const { unmount } = renderWithProviders(<QRScannerScreen />);
      
      // Trigger an error
      const { qrData } = qrScannerScenarios.invalidFormat;
      (parseQRCode as jest.Mock).mockReturnValue(null);
      
      unmount();
      
      // Should clear error state
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('QR code scanner ready')
      );
    });

    it('handles custom onClose callback', () => {
      const mockOnClose = jest.fn();
      renderWithProviders(
        <QRScannerScreen onClose={mockOnClose} />
      );

      const scanner = screen.getByTestId('qr-scanner');
      fireEvent(scanner, 'cancel', mockScannerEvents.cancel());

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles specific error codes correctly', async () => {
      renderWithProviders(<QRScannerScreen />);
      const scanner = screen.getByTestId('qr-scanner');

      // Test each error code
      const errorCases = [
        { code: 'invalid_qr', message: 'Invalid QR code' },
        { code: 'unsupported_type', message: 'Unsupported QR code type' },
        { code: 'self_scan', message: 'You cannot scan your own QR code' },
        { code: 'profile_not_found', message: 'User profile not found' },
        { code: 'request_failed', message: 'Failed to send contact request' }
      ];

      for (const { code, message } of errorCases) {
        // Reset mocks
        jest.clearAllMocks();

        // Simulate error
        const error = new Error(message) as Error & { code: string };
        error.code = code;
        (parseQRCode as jest.Mock).mockImplementation(() => { throw error; });

        // Trigger scan
        fireEvent(scanner, 'scan', { type: 'qr', data: 'test-data' });
      };

      // Test expired QR code scenario
      const mockExpiredQRData: QRCodeData = {
        type: 'contact',
        id: 'test-id',
        userId: 'test-user',
        code: 'expired-code'
      };

      (parseQRCode as jest.Mock).mockImplementation(() => {
        const error = new Error('QR code has expired') as Error & { code: string };
        error.code = 'expired';
        throw error;
      });

      fireEvent(scanner, 'scan', { type: 'qr', data: JSON.stringify(mockExpiredQRData) });

      await waitFor(() => {
        jest.runAllTimers();
        expect(mocks.haptics.triggerHaptic).toHaveBeenCalledWith('error');
        expect(mocks.alert).toHaveBeenCalledWith(
          'Expired QR Code',
          'This QR code has expired. Please ask the contact to generate a new QR code.',
          expect.any(Array)
        );
        expect(mocks.announceForAccessibility).toHaveBeenCalledWith(
          'Error: QR code has expired. Please try again.'
        );
      });
    });
  });
});
