import React from 'react';
import { render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShareProfileScreen } from '../../screens/ShareProfileScreen';
import { QRScannerScreen } from '../../screens/QRScannerScreen';
import { QRCodeDisplay } from '../../components/QRCodeDisplay';
import { LoadingOverlay } from '../../components/LoadingOverlay';

// Mock dependencies
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isScreenReaderEnabled: jest.fn(),
  announceForAccessibility: jest.fn(),
}));

const Stack = createNativeStackNavigator();
const TestNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ShareProfile" component={ShareProfileScreen} />
    <Stack.Screen name="QRScanner" component={QRScannerScreen} />
  </Stack.Navigator>
);

describe('Accessibility Tests', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('QRCodeDisplay Accessibility', () => {
    it('has accessible elements with proper labels', () => {
      const { getByRole } = render(
        <QRCodeDisplay
          qrData="test-data"
          title="Test Title"
          subtitle="Test Subtitle"
        />
      );

      const shareButton = getByRole('button', { name: /share qr code/i });
      expect(shareButton).toHaveAccessibilityValue({ text: 'Share your profile QR code' });
      expect(shareButton).toBeAccessible();
    });

    it('announces share success/failure', async () => {
      const { getByRole } = render(
        <QRCodeDisplay
          qrData="test-data"
          onShare={async () => {}}
        />
      );

      const shareButton = getByRole('button', { name: /share qr code/i });
      await shareButton.props.onPress?.();

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
    });
  });

  describe('QRScannerScreen Accessibility', () => {
    it('provides clear instructions for screen reader users', () => {
      const { getByTestId: queryByTestId } = render(
        <NavigationContainer>
          <QRScannerScreen />
        </NavigationContainer>
      );

      const instructions = queryByTestId('qr-scanner-instructions');
      expect(instructions).toBeTruthy();
      expect(instructions).toHaveTextContent(
        'Point your camera at a QR code to scan it'
      );
    });

    it('announces scanning results', async () => {
      const { getByTestId: queryByTestId } = render(
        <NavigationContainer>
          <QRScannerScreen />
        </NavigationContainer>
      );

      const scanner = queryByTestId('qr-scanner');
      await scanner.props.onScan('test-data');

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
    });
  });

  describe('LoadingOverlay Accessibility', () => {
    it('announces loading state changes', () => {
      const { rerender } = render(
        <LoadingOverlay message="Loading..." />
      );

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Loading...'
      );

      rerender(
        <LoadingOverlay message="Loading..." error="Error occurred" />
      );

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Error occurred'
      );
    });
  });

  describe('ShareProfileScreen Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const { getAllByRole } = render(
        <NavigationContainer>
          <ShareProfileScreen />
        </NavigationContainer>
      );

      const headings = getAllByRole('header');
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0]).toHaveAccessibilityValue({ text: 'Share Your Profile' });
    });

    it('groups related elements properly', () => {
      const { getByTestId: queryByTestId } = render(
        <NavigationContainer>
          <ShareProfileScreen />
        </NavigationContainer>
      );

      const profileSection = queryByTestId('profile-info-section');
      expect(profileSection).toBeTruthy();
      expect(profileSection).toBeAccessible();
    });
  });

  describe('Navigation Accessibility', () => {
    it('provides accessible navigation between screens', () => {
      const { getByRole } = render(
        <NavigationContainer>
          <TestNavigator />
        </NavigationContainer>
      );

      const backButton = getByRole('button', { name: /back/i });
      expect(backButton).toBeAccessible();
    });

    it('announces screen transitions', () => {
      const { getByRole } = render(
        <NavigationContainer>
          <TestNavigator />
        </NavigationContainer>
      );

      const backButton = getByRole('button', { name: /back/i });
      backButton.props.onPress();

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
    });
  });
});
