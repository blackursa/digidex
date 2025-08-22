import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Share, AccessibilityInfo, ActivityIndicator } from 'react-native';
import { renderWithProviders } from '../../utils/test-utils';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { triggerHaptic } from '../../utils/haptics';
import '@testing-library/jest-native/extend-expect';

describe('QRCodeDisplay', () => {
  const mockOnShare = jest.fn();
  const mockOnError = jest.fn();
  const defaultProps = {
    qrData: 'test-qr-data',
    title: 'Test QR Code',
    subtitle: 'Scan this code',
    onShare: mockOnShare,
    onError: mockOnError,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  });

  it('renders correctly with all props', () => {
    const { getByText, getByTestId } = renderWithProviders(<QRCodeDisplay {...defaultProps} />);
    
    const qrContainer = getByTestId('qr-code-container');
    expect(qrContainer).toBeTruthy();
    expect(qrContainer).toHaveProp('accessibilityRole', 'image');
    expect(qrContainer).toHaveProp('accessibilityLabel', 'QR code for Test QR Code');

    expect(getByText('Test QR Code')).toBeTruthy();
    expect(getByText('Scan this code')).toBeTruthy();
    expect(getByText('Share QR Code')).toBeTruthy();
  });

  it('shows loading state correctly', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <QRCodeDisplay {...defaultProps} isLoading={true} />
    );

    expect(getByTestId('qr-loading-indicator')).toBeTruthy();
    expect(queryByTestId('qr-code-container')).toBeNull();
  });

  it('handles QR code generation error', () => {
    const { getByText, queryByTestId } = renderWithProviders(
      <QRCodeDisplay {...defaultProps} qrData="" />
    );

    expect(queryByTestId('qr-code-container')).toBeNull();
    expect(getByText('Failed to generate QR code')).toBeTruthy();
    expect(mockOnError).toHaveBeenCalledWith('Invalid QR code data');
  });

  it('provides proper accessibility feedback', async () => {
    const { getByTestId, getByText } = renderWithProviders(<QRCodeDisplay {...defaultProps} />);
    
    const qrContainer = getByTestId('qr-code-container');
    expect(qrContainer).toHaveProp('accessibilityHint', 'Contains your profile information for sharing');

    const shareButton = getByText('Share QR Code');
    expect(shareButton).toHaveProp('accessibilityRole', 'button');
    expect(shareButton).toHaveProp('accessibilityHint', 'Share your QR code with others');

    fireEvent.press(shareButton);
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('QR code shared successfully');
    });
  });

  it('handles share button press correctly', async () => {
    const { getByText } = renderWithProviders(<QRCodeDisplay {...defaultProps} />);
    const shareButton = getByText('Share QR Code');

    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(triggerHaptic).toHaveBeenCalledWith('impact');
      expect(mockOnShare).toHaveBeenCalledWith('mocked-uri');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('QR code shared successfully');
    });
  });

  it('handles share error correctly', async () => {
    const error = new Error('Share failed');
    (Share.share as jest.Mock).mockRejectedValueOnce(error);

    const { getByText } = renderWithProviders(<QRCodeDisplay {...defaultProps} />);
    const shareButton = getByText('Share QR Code');

    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Failed to share QR code');
      expect(triggerHaptic).toHaveBeenCalledWith('error');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Failed to share QR code. Please try again.');
    });
  });

  it('does not show share button when showShareButton is false', () => {
    const { queryByText, getByTestId } = renderWithProviders(
      <QRCodeDisplay {...defaultProps} showShareButton={false} />
    );
    
    expect(queryByText('Share QR Code')).toBeNull();
    const qrContainer = getByTestId('qr-code-container');
    expect(qrContainer).toHaveProp('accessibilityHint', 'Contains your profile information');
  });

  it('handles different QR code sizes', () => {
    const { getByTestId, rerender } = renderWithProviders(
      <QRCodeDisplay {...defaultProps} size={200} />
    );

    let qrContainer = getByTestId('qr-code-container');
    expect(qrContainer).toHaveStyle({ width: 200, height: 200 });

    rerender(<QRCodeDisplay {...defaultProps} size={300} />);
    qrContainer = getByTestId('qr-code-container');
    expect(qrContainer).toHaveStyle({ width: 300, height: 300 });
  });

  it('updates when QR data changes', () => {
    const { getByTestId, rerender } = renderWithProviders(
      <QRCodeDisplay {...defaultProps} />
    );

    const initialQrContainer = getByTestId('qr-code-container');
    const initialQrValue = initialQrContainer.props.value;

    rerender(<QRCodeDisplay {...defaultProps} qrData="updated-qr-data" />);
    const updatedQrContainer = getByTestId('qr-code-container');
    const updatedQrValue = updatedQrContainer.props.value;

    expect(updatedQrValue).not.toBe(initialQrValue);
  });

  it('handles animation during share action', async () => {
    const { getByText, getByTestId } = renderWithProviders(<QRCodeDisplay {...defaultProps} />);
    const shareButton = getByText('Share QR Code');
    const qrContainer = getByTestId('qr-code-container');

    // Initial scale should be 1
    expect(qrContainer).toHaveStyle({ transform: [{ scale: 1 }] });

    // Press share button
    fireEvent.press(shareButton);

    // Should show loading state
    expect(getByTestId('share-loading-indicator')).toBeTruthy();

    // Wait for share to complete
    await waitFor(() => {
      expect(mockOnShare).toHaveBeenCalled();
    });
  });

  it('handles undefined props gracefully', () => {
    const { getByTestId } = renderWithProviders(
      <QRCodeDisplay
        qrData="test-data"
        onShare={mockOnShare}
        onError={mockOnError}
      />
    );

    const qrContainer = getByTestId('qr-code-container');
    expect(qrContainer).toBeTruthy();
    // Should use default size
    expect(qrContainer).toHaveStyle({ width: 200, height: 200 });
  });

  it('prevents multiple simultaneous share attempts', async () => {
    const { getByText } = renderWithProviders(<QRCodeDisplay {...defaultProps} />);
    const shareButton = getByText('Share QR Code');

    // First press
    fireEvent.press(shareButton);
    // Immediate second press should not trigger another share
    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(mockOnShare).toHaveBeenCalledTimes(1);
    });
  });

  it('announces errors to screen readers', async () => {
    // First test invalid QR data
    const { rerender } = renderWithProviders(
      <QRCodeDisplay {...defaultProps} qrData="" />
    );

    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Failed to generate QR code'
      );
    });

    // Then test share error
    const error = new Error('Share failed');
    (Share.share as jest.Mock).mockRejectedValueOnce(error);

    const { getByText } = renderWithProviders(<QRCodeDisplay {...defaultProps} />);
    const shareButton = getByText('Share QR Code');
    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Failed to share QR code. Please try again.'
      );
    });
  });
});
