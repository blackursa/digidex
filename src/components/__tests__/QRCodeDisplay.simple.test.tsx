import React from 'react';
import { render } from '@testing-library/react-native';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { Share } from 'react-native';
import { triggerHaptic } from '../../utils/haptics';

// Basic mock setup
jest.mock('../../utils/haptics', () => ({
  triggerHaptic: jest.fn(),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn().mockResolvedValue('test-uri'),
}));

describe('QRCodeDisplay', () => {
  const defaultProps = {
    qrData: 'test-data',
    title: 'Test Title',
    subtitle: 'Test Subtitle',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByText } = render(<QRCodeDisplay {...defaultProps} />);
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Subtitle')).toBeTruthy();
  });

  it('handles share button press', async () => {
    const onShare = jest.fn();
    const { getByText } = render(
      <QRCodeDisplay {...defaultProps} onShare={onShare} />
    );

    const shareButton = getByText('Share QR Code');
    shareButton.props.onPress();

    expect(triggerHaptic).toHaveBeenCalledWith('impact');
    expect(onShare).toHaveBeenCalledWith('test-uri');
  });
});
