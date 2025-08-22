import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { AuthProvider } from '../contexts/AuthContext';

// Mock navigation
const navigationMock = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock auth context
const mockAuthContext = {
  user: {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
  },
  isLoading: false,
  error: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
};

// Wrapper component for tests
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NavigationContainer>
    <AuthProvider value={mockAuthContext}>
      {children}
    </AuthProvider>
  </NavigationContainer>
);

// Custom render function
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Mock haptics
jest.mock('../utils/haptics', () => ({
  triggerHaptic: jest.fn(),
}));

// Mock camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
}));

// Mock barcode scanner
jest.mock('expo-barcode-scanner', () => ({
  Constants: {
    BarCodeType: {
      qr: 'qr',
    },
  },
}));

// Mock view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn().mockResolvedValue('mocked-uri'),
}));

// Mock share
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Share: {
      share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
    },
  };
});
