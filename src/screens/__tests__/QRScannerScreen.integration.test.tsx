import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { QRScannerScreen } from '../QRScannerScreen';
import { parseQRCode } from '../../services/qrcode';
import { getUserProfile } from '../../services/firestore';
import { triggerHaptic } from '../../utils/haptics';
import { QRScanError } from '../../utils/errors';
import { AccessibilityInfo } from 'react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  })
}));

jest.mock('../../services/qrcode');
jest.mock('../../services/firestore');
jest.mock('../../utils/haptics');
jest.mock('../../utils/qrScanner', () => ({
  isScanningAvailable: () => true
}));

describe('QRScannerScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('transitions through scan states correctly', async () => {
    const mockProfile = {
      id: 'test-id',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    (parseQRCode as jest.Mock).mockReturnValue({
      type: 'profile',
      id: 'test-id'
    });
    (getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');
    const overlay = getByTestId('status-overlay');

    // Initial state
    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#2196F3' // scanning color
        })
      ])
    );

    // Simulate successful scan
    await act(async () => {
      fireEvent(scanner, 'onBarCodeScanned', { data: 'valid-qr-data' });
    });

    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4CAF50' // success color
        })
      ])
    );
  });

  it('handles error states correctly', async () => {
    (parseQRCode as jest.Mock).mockImplementation(() => {
      throw new QRScanError('invalid_qr');
    });

    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');
    const overlay = getByTestId('status-overlay');

    await act(async () => {
      fireEvent(scanner, 'onBarCodeScanned', { data: 'invalid-qr-data' });
    });

    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#F44336' // error color
        })
      ])
    );
  });

  it('handles retry states correctly', async () => {
    const mockError = new QRScanError('network_error');
    (parseQRCode as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');
    const overlay = getByTestId('status-overlay');

    await act(async () => {
      fireEvent(scanner, 'onBarCodeScanned', { data: 'test-data' });
    });

    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#F44336' // error color
        })
      ])
    );

    // After recovery attempt
    await act(async () => {
      await mockError.recoverFromError();
    });

    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#FFC107' // retry color
        })
      ])
    );
  });

  it('announces status changes to screen readers', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const mockProfile = {
      id: 'test-id',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    (parseQRCode as jest.Mock).mockReturnValue({
      type: 'profile',
      id: 'test-id'
    });
    (getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');

    await act(async () => {
      fireEvent(scanner, 'onBarCodeScanned', { data: 'valid-qr-data' });
    });

    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('Success'));
  });
});
