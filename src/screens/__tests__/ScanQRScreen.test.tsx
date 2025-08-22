import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { ScanQRScreen } from '../ScanQRScreen';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from '@firebase/firestore';
import { useToast } from '../../contexts/ToastContext';

jest.mock('expo-barcode-scanner');
jest.mock('@react-navigation/native');
jest.mock('@firebase/firestore');
jest.mock('../../contexts/ToastContext');

describe('ScanQRScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (BarCodeScanner.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    mockNavigation.navigate.mockClear();
    mockShowToast.mockClear();
  });

  it('requests camera permissions on mount', async () => {
    render(<ScanQRScreen />);

    await waitFor(() => {
      expect(BarCodeScanner.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('shows permission denied message when camera access is denied', async () => {
    (BarCodeScanner.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'denied' 
    });

    const { getByText } = render(<ScanQRScreen />);

    await waitFor(() => {
      expect(getByText('No access to camera')).toBeTruthy();
      expect(getByText('Please enable camera access in your device settings to scan QR codes.')).toBeTruthy();
    });
  });

  it('handles valid QR code scan', async () => {
    const mockUserData = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
    };

    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => mockUserData,
      id: 'user123',
    });

    const { getByTestId } = render(<ScanQRScreen />);

    await act(async () => {
      const scanner = getByTestId('qr-scanner');
      scanner.props.onBarCodeScanned({ data: 'user123_qrcode' });
    });

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('AddContact', {
        contact: expect.objectContaining(mockUserData),
      });
      expect(mockShowToast).toHaveBeenCalledWith(
        'Contact found! Review details to add.',
        'success'
      );
    });
  });

  it('handles invalid QR code format', async () => {
    const { getByTestId } = render(<ScanQRScreen />);

    await act(async () => {
      const scanner = getByTestId('qr-scanner');
      scanner.props.onBarCodeScanned({ data: 'invalid-format' });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Invalid QR code format',
        'error'
      );
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  it('handles non-existent user', async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => false,
    });

    const { getByTestId } = render(<ScanQRScreen />);

    await act(async () => {
      const scanner = getByTestId('qr-scanner');
      scanner.props.onBarCodeScanned({ data: 'user123_qrcode' });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'User not found',
        'error'
      );
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });
});
