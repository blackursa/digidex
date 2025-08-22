import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddContactScreen } from '../AddContactScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, setDoc } from '@firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

jest.mock('@react-navigation/native');
jest.mock('@firebase/firestore');
jest.mock('../../contexts/AuthContext');
jest.mock('../../contexts/ToastContext');

describe('AddContactScreen', () => {
  const mockContact = {
    id: 'contact123',
    displayName: 'John Doe',
    email: 'john@example.com',
    company: 'Tech Corp',
    title: 'Engineer',
    photoURL: 'https://example.com/photo.jpg',
  };

  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockUser = {
    uid: 'user123',
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRoute as jest.Mock).mockReturnValue({
      params: { contact: mockContact },
    });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    mockNavigation.navigate.mockClear();
    mockNavigation.goBack.mockClear();
    mockShowToast.mockClear();
  });

  it('displays contact information correctly', () => {
    const { getByText } = render(<AddContactScreen />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByText('Tech Corp')).toBeTruthy();
    expect(getByText('Engineer')).toBeTruthy();
  });

  it('displays initials when no photo URL is provided', () => {
    (useRoute as jest.Mock).mockReturnValueOnce({
      params: {
        contact: {
          ...mockContact,
          photoURL: undefined,
        },
      },
    });

    const { getByText } = render(<AddContactScreen />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('handles adding contact successfully', async () => {
    const { getByText } = render(<AddContactScreen />);

    fireEvent.press(getByText('Add Contact'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          contactId: 'contact123',
          name: mockContact.displayName,
          email: mockContact.email,
        })
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        'Contact added successfully',
        'success'
      );
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Contacts');
    });
  });

  it('handles adding contact error', async () => {
    const error = new Error('Failed to add contact');
    (setDoc as jest.Mock).mockRejectedValueOnce(error);

    const { getByText } = render(<AddContactScreen />);

    fireEvent.press(getByText('Add Contact'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to add contact',
        'error'
      );
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  it('handles cancel button press', () => {
    const { getByText } = render(<AddContactScreen />);

    fireEvent.press(getByText('Cancel'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows loading state while adding contact', async () => {
    let resolveSetDoc: () => void;
    (setDoc as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSetDoc = resolve;
      })
    );

    const { getByText, queryByText } = render(<AddContactScreen />);

    fireEvent.press(getByText('Add Contact'));

    await waitFor(() => {
      expect(queryByText('Adding contact...')).toBeTruthy();
    });

    resolveSetDoc!();
  });
});
