import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { Contact } from '../../types/models';
import { ContactList } from '../ContactList';
import { getContacts } from '../../services/firestore';
import { renderWithProviders } from '../../utils/test-utils';

// Mock getContacts
const mockGetContacts = jest.fn();
jest.mock('../../services/firestore', () => ({
  getContacts: () => mockGetContacts(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

type Navigation = {
  navigate: (screen: string, params?: any) => void;
};

type Props = {
  navigation?: Navigation;
};

// Mock contacts data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    phone: '+0987654321',
  },
];

// Mock firestore service
const mockGetContacts = jest.fn(() => Promise.resolve(mockContacts));

jest.mock('../../services/firestore', () => ({
  getContacts: () => mockGetContacts()
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

describe('ContactList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContacts.mockResolvedValue(mockContacts);
  });

  it('renders loading state initially', async () => {
    const { getByTestId } = renderWithProviders(<ContactList />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders contacts when loaded', async () => {
    const { getByTestId, getByText } = renderWithProviders(<ContactList />);
    await waitFor(() => {
      const contactList = getByTestId('contact-list');
      expect(contactList).toBeTruthy();
      expect(getByText(mockContacts[0].name)).toBeTruthy();
    });
  });

  it('shows error when loading fails', async () => {
    mockGetContacts.mockRejectedValueOnce(new Error('Failed to load'));
    const { getByTestId, getByText } = renderWithProviders(<ContactList />);
    await waitFor(() => {
      const errorMessage = getByTestId('error-message');
      expect(errorMessage).toBeTruthy();
      expect(getByText('Error loading contacts')).toBeTruthy();
    });
  });

  it('filters contacts by search term', async () => {
    const { getByTestId, getByPlaceholderText, queryByText } = renderWithProviders(<ContactList />);
    const searchInput = getByPlaceholderText('Search contacts');

    await waitFor(() => {
      expect(getByTestId('contact-list')).toBeTruthy();
    });

    fireEvent.changeText(searchInput, 'John');
    expect(queryByText('John Doe')).toBeTruthy();
    expect(queryByText('Jane Smith')).toBeNull();
  });

  it('sorts contacts by name', async () => {
    const { getByTestId, getAllByTestId } = renderWithProviders(<ContactList />);
    const sortButton = getByTestId('sort-button');

    await waitFor(() => {
      expect(getByTestId('contact-list')).toBeTruthy();
    });

    fireEvent.press(sortButton);
    const contactNames = getAllByTestId('contact-name').map(node => node.props.children);
    expect(contactNames).toEqual(['Bob Wilson', 'Jane Smith', 'John Doe']);
  });

  it('handles empty contact list', async () => {
    mockGetContacts.mockResolvedValue([]);
    const { getByText } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      const emptyMessage = getByText('No contacts found');
      expect(emptyMessage).toBeTruthy();
    });
  });

  it('handles contact selection', async () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getAllByTestId } = renderWithProviders(<ContactList navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalled();
    });

    const contactItems = getAllByTestId('contact-item');
    fireEvent.press(contactItems[0]);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ContactDetails', {
      contactId: mockContacts[0].id
    });
  });

  it('handles fetch error', async () => {
    const error = new Error('Failed to fetch contacts');
    (getContacts as jest.Mock).mockRejectedValue(error);

    const { getByText } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to fetch contacts',
        [{ text: 'Retry', onPress: expect.any(Function) }]
      );
    });

    // Test retry functionality
    const alertButtons = ((Alert.alert as jest.Mock).mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>);
    const retryButton = alertButtons.find(btn => btn.text === 'Retry');
    retryButton?.onPress?.();

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalledTimes(2);
    });
  });

  it('supports pull-to-refresh', async () => {
    const { getByTestId } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalled();
    });

    const flatList = getByTestId('contact-list');
    const { refreshControl } = flatList.props;
    
    // Trigger refresh
    refreshControl.props.onRefresh();

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalledTimes(2);
      expect(refreshControl.props.refreshing).toBe(false);
    });
  });

  it('filters contacts by email', async () => {
    const { getByTestId, getAllByTestId, getByText } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalled();
    });

    // Open filter menu
    fireEvent.press(getByTestId('filter-button'));
    fireEvent.press(getByText('Has Email'));

    const contactItems = getAllByTestId('contact-item');
    expect(contactItems).toHaveLength(2); // Only John and Bob have emails
    expect(contactItems[0]).toHaveTextContent('John Doe');
    expect(contactItems[1]).toHaveTextContent('Bob Wilson');
  });

  it('filters contacts by phone', async () => {
    const { getByTestId, getAllByTestId, getByText } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalled();
    });

    // Open filter menu
    fireEvent.press(getByTestId('filter-button'));
    fireEvent.press(getByText('Has Phone'));

    const contactItems = getAllByTestId('contact-item');
    expect(contactItems).toHaveLength(2); // Only Jane and Bob have phones
    expect(contactItems[0]).toHaveTextContent('Jane Smith');
    expect(contactItems[1]).toHaveTextContent('Bob Wilson');
  });

  it('sorts contacts by name in ascending and descending order', async () => {
    const { getByTestId, getAllByTestId, getByText } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalled();
    });

    // Test ascending sort
    fireEvent.press(getByTestId('sort-button'));
    fireEvent.press(getByText('Name (A-Z)'));

    let contactItems = getAllByTestId('contact-item');
    expect(contactItems[0]).toHaveTextContent('Bob Wilson');
    expect(contactItems[1]).toHaveTextContent('Jane Smith');
    expect(contactItems[2]).toHaveTextContent('John Doe');

    // Test descending sort
    fireEvent.press(getByTestId('sort-button'));
    fireEvent.press(getByText('Name (Z-A)'));

    contactItems = getAllByTestId('contact-item');
    expect(contactItems[0]).toHaveTextContent('John Doe');
    expect(contactItems[1]).toHaveTextContent('Jane Smith');
    expect(contactItems[2]).toHaveTextContent('Bob Wilson');
  });

  it('combines search, filter, and sort', async () => {
    const { getByTestId, getAllByTestId, getByText } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalled();
    });

    // Apply email filter
    fireEvent.press(getByTestId('filter-button'));
    fireEvent.press(getByText('Has Email'));

    // Apply search
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'o'); // Matches John and Bob

    // Apply sort
    fireEvent.press(getByTestId('sort-button'));
    fireEvent.press(getByText('Name (A-Z)'));

    const contactItems = getAllByTestId('contact-item');
    expect(contactItems).toHaveLength(2);
    expect(contactItems[0]).toHaveTextContent('Bob Wilson');
    expect(contactItems[1]).toHaveTextContent('John Doe');
  });

  it('handles contact search', async () => {
    const { getByTestId, getAllByTestId } = renderWithProviders(<ContactList />);

    await waitFor(() => {
      expect(getContacts).toHaveBeenCalled();
    });

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'John');

    const contactItems = getAllByTestId('contact-item');
    expect(contactItems).toHaveLength(1);
    expect(contactItems[0]).toHaveTextContent('John Doe');
  });
});
