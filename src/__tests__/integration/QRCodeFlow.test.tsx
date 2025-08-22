import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Share } from 'react-native';
import { ShareProfileScreen } from '../../screens/ShareProfileScreen';
import { QRScannerScreen } from '../../screens/QRScannerScreen';
import { generateQRCode, parseQRCode } from '../../services/qrcode';
import { getUserProfile, createContactRequest } from '../../services/firestore';
import { triggerHaptic } from '../../utils/haptics';

// Mock dependencies
jest.mock('../../services/firestore');
jest.mock('../../services/qrcode');
jest.mock('../../utils/haptics');
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Mock navigation
const Stack = createNativeStackNavigator();
const TestNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ShareProfile" component={ShareProfileScreen} />
    <Stack.Screen name="QRScanner" component={QRScannerScreen} />
  </Stack.Navigator>
);

// Mock auth context
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    error: null,
  }),
}));

describe('QR Code Sharing and Scanning Flow', () => {
  const mockQRData = 'test-qr-data';
  const mockProfileData = {
    type: 'profile',
    id: 'other-user-id',
  };
  const mockOtherUser = {
    id: 'other-user-id',
    displayName: 'Other User',
    email: 'other@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (generateQRCode as jest.Mock).mockReturnValue(mockQRData);
    (parseQRCode as jest.Mock).mockReturnValue(mockProfileData);
    (getUserProfile as jest.Mock).mockResolvedValue(mockOtherUser);
    (createContactRequest as jest.Mock).mockResolvedValue(undefined);
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(
      <NavigationContainer>
        <TestNavigator />
      </NavigationContainer>
    );
  };

  describe('Share Profile Flow', () => {
    it('generates and shares QR code successfully', async () => {
      const { getByText, queryByText } = renderWithNavigation(<ShareProfileScreen />);
      
      // Verify profile info is displayed
      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();

      // Verify QR code is generated
      expect(generateQRCode).toHaveBeenCalledWith({
        type: 'profile',
        id: mockUser.uid,
      });

      // Share QR code
      const shareButton = getByText('Share QR Code');
      await act(async () => {
        fireEvent.press(shareButton);
      });

      expect(triggerHaptic).toHaveBeenCalledWith('impact');
      expect(Share.share).toHaveBeenCalled();
      expect(queryByText('Failed to share QR code')).toBeNull();
    });
  });

  describe('Scan QR Code Flow', () => {
    it('successfully scans and sends contact request', async () => {
      const { getByTestId, getByText } = renderWithNavigation(<QRScannerScreen />);
      
      // Simulate QR code scan
      const scanner = getByTestId('qr-scanner');
      await act(async () => {
        await scanner.props.onScan(mockQRData);
      });

      // Verify profile lookup
      expect(parseQRCode).toHaveBeenCalledWith(mockQRData);
      expect(getUserProfile).toHaveBeenCalledWith(mockProfileData.id);
      expect(triggerHaptic).toHaveBeenCalledWith('impact');

      // Verify contact request dialog
      expect(getByText('Add Contact')).toBeTruthy();
      expect(getByText('Would you like to send a contact request to Other User?')).toBeTruthy();

      // Confirm contact request
      const confirmButton = getByText('Send Request');
      await act(async () => {
        fireEvent.press(confirmButton);
      });

      expect(createContactRequest).toHaveBeenCalledWith(
        mockUser.uid,
        mockOtherUser.id
      );
      expect(triggerHaptic).toHaveBeenCalledWith('success');
    });

    it('handles invalid QR code gracefully', async () => {
      (parseQRCode as jest.Mock).mockReturnValue(null);
      
      const { getByTestId, getByText } = renderWithNavigation(<QRScannerScreen />);
      
      // Simulate invalid QR code scan
      const scanner = getByTestId('qr-scanner');
      await act(async () => {
        await scanner.props.onScan('invalid-data');
      });

      expect(triggerHaptic).toHaveBeenCalledWith('error');
      expect(getByText('Invalid QR code')).toBeTruthy();
    });

    it('handles user not found gracefully', async () => {
      (getUserProfile as jest.Mock).mockResolvedValue(null);
      
      const { getByTestId, getByText } = renderWithNavigation(<QRScannerScreen />);
      
      // Simulate QR code scan for non-existent user
      const scanner = getByTestId('qr-scanner');
      await act(async () => {
        await scanner.props.onScan(mockQRData);
      });

      expect(triggerHaptic).toHaveBeenCalledWith('error');
      expect(getByText('User profile not found')).toBeTruthy();
    });

    it('prevents scanning your own QR code', async () => {
      (parseQRCode as jest.Mock).mockReturnValue({
        type: 'profile',
        id: mockUser.uid,
      });
      
      const { getByTestId, getByText } = renderWithNavigation(<QRScannerScreen />);
      
      // Simulate scanning own QR code
      const scanner = getByTestId('qr-scanner');
      await act(async () => {
        await scanner.props.onScan(mockQRData);
      });

      expect(triggerHaptic).toHaveBeenCalledWith('error');
      expect(getByText('You cannot scan your own QR code')).toBeTruthy();
    });
  });
});
