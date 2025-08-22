const React = require('react');
const { Alert } = require('react-native');
const { fireEvent, render } = require('@testing-library/react-native');
const { QRScannerScreen } = require('../QRScannerScreen');

// Basic mocks
jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  View: 'View',
  Text: 'Text'
}));

describe('QRScannerScreen Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<QRScannerScreen />);
    expect(getByTestId('qr-scanner')).toBeTruthy();
  });

  it('handles basic scan event', () => {
    const { getByTestId } = render(<QRScannerScreen />);
    const scanner = getByTestId('qr-scanner');
    
    fireEvent(scanner, 'scan', { data: 'test-qr-code' });
    expect(Alert.alert).toHaveBeenCalled();
  });
});
