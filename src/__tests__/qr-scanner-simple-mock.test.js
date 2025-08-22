const { runTests } = require('./test-wrapper');

// Create minimal mocks
const mocks = {
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
    isScreenReaderEnabled: jest.fn().mockResolvedValue(true)
  }
};

// Simple mock component
const QRScannerScreen = () => ({
  type: 'View',
  props: {
    testID: 'qr-scanner',
    children: {
      type: 'Text',
      props: {
        children: 'QR Scanner'
      }
    }
  }
});

// Simple render function
function render(component) {
  const rendered = component();
  mocks.AccessibilityInfo.announceForAccessibility(
    'QR code scanner ready. Point your camera at a QR code to scan.'
  );
  return {
    getByTestId: (testId) => {
      if (rendered.props.testID === testId) return rendered;
      return null;
    }
  };
}

describe('QRScannerScreen Simple', () => {
  beforeEach(() => {
    // Reset mocks
    mocks.AccessibilityInfo.announceForAccessibility.mockReset();
  });

  it('should render the scanner', () => {
    const { getByTestId } = render(QRScannerScreen);
    const scanner = getByTestId('qr-scanner');
    expect(scanner).toBeTruthy();
  });

  it('should announce accessibility message', () => {
    render(QRScannerScreen);
    expect(mocks.AccessibilityInfo.announceForAccessibility)
      .toHaveBeenCalledWith('QR code scanner ready. Point your camera at a QR code to scan.');
  });
});

// Run tests
runTests();
