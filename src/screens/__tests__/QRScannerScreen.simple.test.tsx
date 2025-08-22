import React from 'react';
import { render } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QRScannerScreen } from '../QRScannerScreen';
import { triggerHaptic } from '../../utils/haptics';
import { getUserProfile } from '../../services/firestore';
import { parseQRCode } from '../../services/qrcode';
import { isScanningAvailable } from '../../utils/qrScanner';

// Mock dependencies
jest.mock('../../utils/haptics');
jest.mock('../../services/firestore');
jest.mock('../../services/qrcode');
jest.mock('../../utils/qrScanner');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

const mockUserProfile = {
  id: 'test-user-id',
  displayName: 'Test User',
  email: 'test@example.com',
};

describe('QRScannerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isScanningAvailable as jest.Mock).mockReturnValue(true);
    (getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
    (parseQRCode as jest.Mock).mockReturnValue({ 
      type: 'profile', 
      id: 'test-user-id' 
    });
  });

  it('shows camera not available message when scanning is unavailable', () => {
    (isScanningAvailable as jest.Mock).mockReturnValue(false);
    const { getByText } = render(<QRScannerScreen />);
    
    expect(getByText('Camera scanning is not available on this device.')).toBeTruthy();
  });

  it('shows QR scanner when camera is available', () => {
    const { getByTestId } = render(<QRScannerScreen />);
    expect(getByTestId('qr-scanner')).toBeTruthy();
  });

  it('handles invalid QR code data', async () => {
    (parseQRCode as jest.Mock).mockReturnValue(null);
    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');

    // Simulate QR code scan
    await scanner.props.onScan('invalid-data');

    expect(triggerHaptic).toHaveBeenCalledWith('error');
  });

  it('handles user profile not found', async () => {
    (getUserProfile as jest.Mock).mockResolvedValue(null);
    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');

    await scanner.props.onScan('valid-data');

    expect(triggerHaptic).toHaveBeenCalledWith('error');
  });

  it('shows contact request alert on valid scan', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');

    await scanner.props.onScan('valid-data');

    expect(alertSpy).toHaveBeenCalledWith(
      'Add Contact',
      'Would you like to send a contact request to Test User?',
      expect.any(Array)
    );
  });
});
