import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContactsScreen } from '../ContactsScreen';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('@firebase/firestore');
jest.mock('@react-navigation/native');
jest.mock('../../contexts/AuthContext');

const mockContacts = [
  {
    id: '1',
    name: 'John Doe',
    displayName: 'John Doe',
    email: 'john@example.com',
    company: 'Tech Corp',
    title: 'Engineer',
    photoURL: 'https://example.com/photo1.jpg',
    userId: 'user123',
    qrCode: 'qr-code-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    displayName: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Design Co',
    title: 'Designer',
    photoURL: 'https://example.com/photo2.jpg',
    userId: 'user123',
    qrCode: 'qr-code-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('ContactsScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'user123' } });
    (collection as jest.Mock).mockReturnValue({});
    (query as jest.Mock).mockReturnValue({});
    (where as jest.Mock).mockReturnValue({});
    (getDocs as jest.Mock).mockResolvedValue({
      docs: mockContacts.map(contact => ({
        id: contact.id,
        data: () => contact,
      })),
    });
  });

  it('loads and displays contacts', async () => {
    const { getByText, queryByText } = render(<ContactsScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Tech Corp')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
      expect(getByText('Design Co')).toBeTruthy();
      expect(queryByText('No contacts found')).toBeNull();
    });
  });

  it('displays empty state when no contacts', async () => {
    (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
    
    const { getByText } = render(<ContactsScreen />);

    await waitFor(() => {
      expect(getByText('No contacts found')).toBeTruthy();
    });
  });

  it('handles contact selection', async () => {
    const { getByText } = render(<ContactsScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    fireEvent.press(getByText('John Doe'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ContactDetails', {
      contact: mockContacts[0],
    });
  });

  it('handles loading error', async () => {
    (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Failed to load contacts'));
    
    const { getByText } = render(<ContactsScreen />);

    await waitFor(() => {
      expect(getByText('Error loading contacts')).toBeTruthy();
    });
  });

  it('filters contacts by search', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ContactsScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search contacts');
    fireEvent.changeText(searchInput, 'John');

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(queryByText('Jane Smith')).toBeNull();
    });
  });
});
