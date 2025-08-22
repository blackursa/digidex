const React = require('react');
const { render } = require('@testing-library/react-native');

// Minimal mock setup
const mockFn = () => jest.fn();
const mocks = {
  firestore: {
    getUserProfile: mockFn(),
  },
  haptics: {
    triggerHaptic: mockFn(),
  },
};

// Mock modules
jest.mock('../../services/firestore', () => mocks.firestore);
jest.mock('../../utils/haptics', () => mocks.haptics);

// Minimal component
const MinimalQRScreen = () => {
  return React.createElement('View', { testID: 'qr-scanner' });
};

// Test suite
describe('MinimalQRScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(React.createElement(MinimalQRScreen));
    const element = getByTestId('qr-scanner');
    expect(element).toBeTruthy();
  });
});
