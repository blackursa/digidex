const { runTests, render } = require('./react-native-test-wrapper');
const React = require('react');
const { AccessibilityInfo } = require('react-native');

// Mock React Native components
const View = 'View';
const Text = 'Text';

// Create a simple component for testing
const TestQRScreen = () => React.createElement(View, {
  testID: 'qr-scanner',
  children: React.createElement(Text, {
    children: 'QR Scanner'
  })
});

// Mock AccessibilityInfo
AccessibilityInfo.announceForAccessibility = jest.fn();
AccessibilityInfo.isScreenReaderEnabled = jest.fn().mockResolvedValue(true);

describe('QR Scanner Simple Tests', () => {
  beforeAll(() => {
    console.log('Setting up QR Scanner test suite...');
  });

  beforeEach(() => {
    // Clear mock calls
    AccessibilityInfo.announceForAccessibility.mockClear();
  });

  it('should render the QR scanner component', () => {
    const { getByTestId } = render(React.createElement(TestQRScreen));
    const scanner = getByTestId('qr-scanner');
    expect(scanner).toBeTruthy();
  });

  it('should announce accessibility message', () => {
    render(React.createElement(TestQRScreen));
    expect(AccessibilityInfo.announceForAccessibility)
      .toHaveBeenCalledWith('QR code scanner ready. Point your camera at a QR code to scan.');
  });
});

// Run the tests
runTests();
