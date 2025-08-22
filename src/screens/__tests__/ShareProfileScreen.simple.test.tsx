import React from 'react';
import { render } from '@testing-library/react-native';
import { Share } from 'react-native';
import { ShareProfileScreen } from '../ShareProfileScreen';
import { generateQRCode } from '../../services/qrcode';
import { triggerHaptic } from '../../utils/haptics';

// Mock dependencies
jest.mock('../../utils/haptics');
jest.mock('../../services/qrcode');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Share: {
      share: jest.fn(),
    },
  };
});

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

describe('ShareProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateQRCode as jest.Mock).mockReturnValue('test-qr-data');
  });

  it('renders user profile information', () => {
    const { getByText } = render(<ShareProfileScreen />);
    
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
  });

  it('shows sign in message when user is not authenticated', () => {
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth')
      .mockReturnValue({ user: null, isLoading: false, error: null });

    const { getByText } = render(<ShareProfileScreen />);
    expect(getByText('Please sign in to share your profile')).toBeTruthy();
  });

  it('generates QR code with correct user data', () => {
    render(<ShareProfileScreen />);
    
    expect(generateQRCode).toHaveBeenCalledWith({
      type: 'profile',
      id: 'test-user-id',
    });
  });

  it('handles share button press', async () => {
    const { getByText } = render(<ShareProfileScreen />);
    const shareButton = getByText('Share QR Code');

    await shareButton.props.onPress();

    expect(triggerHaptic).toHaveBeenCalledWith('impact');
    expect(Share.share).toHaveBeenCalledWith({
      url: expect.any(String),
      message: 'Scan this QR code to add me as a contact!',
    });
  });

  it('handles share error', async () => {
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share failed'));
    const { getByText } = render(<ShareProfileScreen />);
    const shareButton = getByText('Share QR Code');

    await shareButton.props.onPress();

    expect(triggerHaptic).toHaveBeenCalledWith('error');
    expect(getByText('Failed to share QR code')).toBeTruthy();
  });
});
