import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { QRGeneratorScreen } from '../QRGeneratorScreen';
import { Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(),
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Share: {
    share: jest.fn(),
  },
}));

describe('QRGeneratorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates QR code when button is pressed', () => {
    const { getByPlaceholderText, getByText, queryByTestId } = render(
      <QRGeneratorScreen />
    );

    const input = getByPlaceholderText('Enter profile ID');
    const generateButton = getByText('Generate QR Code');

    expect(queryByTestId('qr-code')).toBeNull();

    fireEvent.changeText(input, 'test-profile');
    fireEvent.press(generateButton);

    const qrCode = queryByTestId('qr-code');
    expect(qrCode).toBeTruthy();
    expect(qrCode?.props.value).toContain('test-profile');
  });

  it('shares QR code when share button is pressed', async () => {
    const mockUri = 'file://test.png';
    (captureRef as jest.Mock).mockResolvedValue(mockUri);

    const { getByText } = render(<QRGeneratorScreen />);
    
    // Generate QR code first
    fireEvent.changeText(getByPlaceholderText('Enter profile ID'), 'test-profile');
    fireEvent.press(getByText('Generate QR Code'));

    // Try to share
    await act(async () => {
      fireEvent.press(getByText('Share QR Code'));
    });

    expect(captureRef).toHaveBeenCalled();
    expect(Share.share).toHaveBeenCalledWith({
      url: mockUri,
      message: 'Scan this QR code to view my profile',
    });
  });

  it('handles share errors gracefully', async () => {
    const mockError = new Error('Share failed');
    (captureRef as jest.Mock).mockRejectedValue(mockError);
    console.error = jest.fn();

    const { getByText } = render(<QRGeneratorScreen />);
    
    // Generate QR code first
    fireEvent.changeText(getByPlaceholderText('Enter profile ID'), 'test-profile');
    fireEvent.press(getByText('Generate QR Code'));

    // Try to share
    await act(async () => {
      fireEvent.press(getByText('Share QR Code'));
    });

    expect(console.error).toHaveBeenCalledWith('Failed to share QR code:', mockError);
  });
});
