import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QRCodeScreen } from '../QRCodeScreen';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from '@firebase/firestore';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '@react-navigation/native';

jest.mock('@firebase/firestore');
jest.mock('../../contexts/AuthContext');
jest.mock('../../contexts/ToastContext');
jest.mock('@react-navigation/native');
jest.mock('react-native-qrcode-svg', () => 'QRCode');

describe('QRCodeScreen', () => {
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
  };

  const mockProfile = {
    displayName: 'John Doe',
    company: 'Tech Corp',
    title: 'Engineer',
    qrCode: 'qr-code-123',
  };

  const mockShowToast = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    (doc as jest.Mock).mockReturnValue({});
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockProfile,
    });
    mockShowToast.mockClear();
    mockNavigate.mockClear();
  });

  it('loads and displays QR code with profile info', async () => {
    const { getByText } = render(<QRCodeScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Tech Corp')).toBeTruthy();
      expect(getByText('Engineer')).toBeTruthy();
      expect(getByText('Show this QR code to share your contact info')).toBeTruthy();
    });
  });

  it('redirects to login if no user', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<QRCodeScreen />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  it('handles profile loading error', async () => {
    (getDoc as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load profile')
    );

    render(<QRCodeScreen />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to load profile',
        'error'
      );
      expect(mockNavigate).toHaveBeenCalledWith('goBack');
    });
  });

  it('handles non-existent profile', async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => false,
      data: () => null,
    });

    render(<QRCodeScreen />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Profile not found',
        'error'
      );
      expect(mockNavigate).toHaveBeenCalledWith('goBack');
    });
  });
});
