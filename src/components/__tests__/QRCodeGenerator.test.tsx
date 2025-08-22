import React from 'react';
import { render } from '@testing-library/react-native';
import { QRCodeData } from '../../types/qrcode';
import { QRCodeGenerator } from '../QRCodeGenerator';

jest.mock('react-native-qrcode-svg', () => 'QRCode');

describe('QRCodeGenerator', () => {
  const mockData: QRCodeData = {
    type: 'profile',
    id: 'test-id',
    version: '1.0',
  };

  it('renders with default props', () => {
    const { getByTestId } = render(
      <QRCodeGenerator data={mockData} />
    );
    const qrCode = getByTestId('qr-code');
    expect(qrCode.props.size).toBe(200);
    expect(qrCode.props.color).toBe('#000000');
    expect(qrCode.props.backgroundColor).toBe('#ffffff');
  });

  it('handles errors correctly', () => {
    const mockOnError = jest.fn();
    const { rerender } = render(
      <QRCodeGenerator 
        data={mockData} 
        onError={mockOnError}
      />
    );

    // Simulate error
    const error = new Error('QR code error');
    rerender(
      <QRCodeGenerator 
        data={mockData} 
        onError={mockOnError}
      />
    );
    
    expect(mockOnError).toHaveBeenCalledWith(error);
  });
});
