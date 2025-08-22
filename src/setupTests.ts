// Import mock environment configuration
import './config/testEnv';

// Mock React Native modules that aren't available in the test environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock React Native's Alert and AccessibilityInfo
const mockAlert = jest.fn();
jest.mock('react-native', () => ({
  Alert: {
    alert: mockAlert
  },
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
    isScreenReaderEnabled: jest.fn().mockResolvedValue(true)
  },
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: Record<string, any>) => styles
  }
}));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
}));

jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
}));

// Set up global test timeouts and configurations
jest.setTimeout(30000);

// Ensure all pending timers and promises are handled
afterEach(async () => {
  // Wait for any pending promises
  await new Promise(resolve => setImmediate(resolve));
});

afterAll(async () => {
  // Final cleanup of any remaining promises
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
