const { runTests } = require('./test-wrapper');

// Mock React Native modules without requiring them
const mockReactNative = {
  View: 'View',
  Text: 'Text',
  AccessibilityInfo: {
    announceForAccessibility: () => {},
    isScreenReaderEnabled: () => Promise.resolve(true)
  }
};

// Simple test to verify our setup
describe('Mock Test Suite', () => {
  it('should work with mocked RN components', () => {
    const { View, Text } = mockReactNative;
    expect(View).toBe('View');
    expect(Text).toBe('Text');
  });

  it('should handle async operations', async () => {
    const { AccessibilityInfo } = mockReactNative;
    const result = await AccessibilityInfo.isScreenReaderEnabled();
    expect(result).toBe(true);
  });
});

// Run the tests
runTests();
