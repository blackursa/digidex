import '@testing-library/jest-native/extend-expect';

// Add custom matchers for accessibility testing
expect.extend({
  toBeAccessible(received) {
    const pass = received.props.accessible !== false;
    return {
      message: () =>
        `expected ${received.type} to ${pass ? 'not ' : ''}be accessible`,
      pass,
    };
  },
  toHaveAccessibilityValue(received, expected) {
    const value = received.props.accessibilityValue?.text || 
                  received.props.accessibilityLabel;
    const pass = value === expected.text;
    return {
      message: () =>
        `expected ${received.type} to ${pass ? 'not ' : ''}have accessibility value ${expected.text}`,
      pass,
    };
  },
});

// Mock AccessibilityInfo globally
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  announceForAccessibility: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Extend the expect interface for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
      toHaveAccessibilityValue(value: { text: string }): R;
    }
  }
}
