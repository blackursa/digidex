import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ContactCard } from '../ContactCard';

const mockContact = {
  name: 'John Doe',
  email: 'john@example.com',
  qrCode: 'mock-qr-code',
  id: '123',
  displayName: 'John Doe',
  company: 'Test Corp',
  title: 'Software Engineer',
  photoURL: 'https://example.com/photo.jpg',
  userId: 'user123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('ContactCard', () => {
  beforeEach(() => {
    mockNavigation.navigate.mockClear();
  });

  it('renders contact information correctly', () => {
    const { getByText } = render(<ContactCard contact={mockContact} onPress={() => {}} />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Test Corp')).toBeTruthy();
    expect(getByText('Software Engineer')).toBeTruthy();
  });

  it('displays initials when no photo URL is provided', () => {
    const contactWithoutPhoto = { ...mockContact, photoURL: undefined };
    const { getByText } = render(<ContactCard contact={contactWithoutPhoto} onPress={() => {}} />);

    expect(getByText('JD')).toBeTruthy();
  });

  it('navigates to contact details on press', () => {
    const { getByTestId } = render(<ContactCard contact={mockContact} onPress={() => {}} />);

    fireEvent.press(getByTestId('contact-card'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ContactDetails', {
      contact: mockContact,
    });
  });

  it('renders company and title when both are provided', () => {
    const { getByText } = render(<ContactCard contact={mockContact} onPress={() => {}} />);

    expect(getByText('Test Corp')).toBeTruthy();
    expect(getByText('Software Engineer')).toBeTruthy();
  });

  it('renders only company when title is not provided', () => {
    const contactWithoutTitle = { ...mockContact, title: undefined };
    const { getByText, queryByText } = render(
      <ContactCard contact={contactWithoutTitle} onPress={() => {}} />
    );

    expect(getByText('Test Corp')).toBeTruthy();
    expect(queryByText('Software Engineer')).toBeNull();
  });

  it('renders only title when company is not provided', () => {
    const contactWithoutCompany = { ...mockContact, company: undefined };
    const { getByText, queryByText } = render(
      <ContactCard contact={contactWithoutCompany} onPress={() => {}} />
    );

    expect(queryByText('Test Corp')).toBeNull();
    expect(getByText('Software Engineer')).toBeTruthy();
  });
});
