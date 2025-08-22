import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ScanHistoryScreen } from '../ScanHistoryScreen';
import { getScanHistory, clearScanHistory } from '../../services/scanHistory';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

// Mock scan history service
jest.mock('../../services/scanHistory', () => ({
  getScanHistory: jest.fn(),
  clearScanHistory: jest.fn(),
}));

describe('ScanHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no history exists', async () => {
    (getScanHistory as jest.Mock).mockResolvedValue([]);

    const { getByText, queryByTestId } = render(
      <NavigationContainer>
        <ScanHistoryScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('No scan history')).toBeTruthy();
    });
    expect(queryByTestId('scan-history-list')).toBeNull();
  });

  it('renders scan history items', async () => {
    const mockHistory = [
      {
        id: 'test-1',
        type: 'profile',
        timestamp: Date.now(),
        data: {
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    ];

    (getScanHistory as jest.Mock).mockResolvedValue(mockHistory);

    const { getByText, queryByText } = render(
      <NavigationContainer>
        <ScanHistoryScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });
    expect(queryByText('No scan history')).toBeNull();
  });

  it('clears history when clear button is pressed', async () => {
    const mockHistory = [
      {
        id: 'test-1',
        type: 'profile',
        timestamp: Date.now(),
        data: {
          name: 'Test User'
        }
      }
    ];

    (getScanHistory as jest.Mock).mockResolvedValue(mockHistory);
    (clearScanHistory as jest.Mock).mockResolvedValue(true);

    const { getByText, findByText } = render(
      <NavigationContainer>
        <ScanHistoryScreen />
      </NavigationContainer>
    );

    // Wait for history to load
    await findByText('Test User');

    // Find and press clear button
    const clearButton = await findByText('Clear');
    fireEvent.press(clearButton);

    // Confirm clear action
    const confirmButton = await findByText('Clear');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(clearScanHistory).toHaveBeenCalled();
    });
  });
});
