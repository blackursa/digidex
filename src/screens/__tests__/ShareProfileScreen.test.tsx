import React from 'react';
import { Share, AccessibilityInfo } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/test-utils';
import { ShareProfileScreen } from '../ShareProfileScreen';
import { generateQRCode } from '../../services/qrcode';
import { triggerHaptic } from '../../utils/haptics';

// Mock dependencies
jest.mock('../../services/qrcode');
jest.mock('../../utils/haptics');
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));
jest.mock('react-native/Libraries/Utilities/AccessibilityInfo', () => ({
  announceForAccessibility: jest.fn(),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(true)),
}));

describe('ShareProfileScreen', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (generateQRCode as jest.Mock).mockReturnValue('test-qr-data');
    (Share.share as jest.Mock).mockResolvedValue({ action: 'sharedAction' });
    (triggerHaptic as jest.Mock).mockResolvedValue(undefined);
  });

  it('announces screen purpose on mount', () => {
    renderWithProviders(<ShareProfileScreen />, { user: mockUser });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Share profile screen. Your QR code is ready to be shared.'
    );
  });

  it('shows authentication error when user is not logged in', () => {
    const { getByText } = renderWithProviders(<ShareProfileScreen />, { user: null });

    expect(getByText('Please sign in to share your profile')).toBeTruthy();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Authentication required. Please sign in to share your profile.'
    );
  });

  it('handles QR code generation error', () => {
    (generateQRCode as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to generate QR code');
    });

    const { getByText } = renderWithProviders(<ShareProfileScreen />, { user: mockUser });

    expect(getByText('Failed to generate QR code')).toBeTruthy();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Error: Failed to generate QR code. Please try again.'
    );
  });

  it('handles successful share action', async () => {
    const { getByText } = renderWithProviders(<ShareProfileScreen />, { user: mockUser });
    const shareButton = getByText('Share QR Code');

    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(triggerHaptic).toHaveBeenCalledWith('impact');
      expect(Share.share).toHaveBeenCalledWith({
        url: expect.any(String),
        message: 'Scan this QR code to add me as a contact!'
      });
      expect(triggerHaptic).toHaveBeenCalledWith('success');
    });
  });

  it('handles share action error', async () => {
    const error = new Error('Share failed');
    (Share.share as jest.Mock).mockRejectedValue(error);

    const { getByText } = renderWithProviders(<ShareProfileScreen />, { user: mockUser });
    const shareButton = getByText('Share QR Code');

    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(triggerHaptic).toHaveBeenCalledWith('error');
      expect(getByText('Failed to share QR code')).toBeTruthy();
    });
  });

  it('displays user profile information', () => {
    const { getByText } = renderWithProviders(<ShareProfileScreen />, { user: mockUser });

    expect(getByText(mockUser.displayName)).toBeTruthy();
    expect(getByText(mockUser.email)).toBeTruthy();
  });

  it('cleans up error state on unmount', () => {
    const { unmount } = renderWithProviders(<ShareProfileScreen />, { user: mockUser });
    
    // Trigger an error
    const error = new Error('Share failed');
    (Share.share as jest.Mock).mockRejectedValue(error);
    
    unmount();
    
    // Should clear error state
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Share profile screen')
    );
  });

  it('handles custom onClose callback', () => {
    const mockOnClose = jest.fn();
    const { unmount } = renderWithProviders(
      <ShareProfileScreen onClose={mockOnClose} />,
      { user: mockUser }
    );

    unmount();

    expect(mockOnClose).toHaveBeenCalled();
  });
});
