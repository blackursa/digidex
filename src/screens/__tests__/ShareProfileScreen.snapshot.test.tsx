import React from 'react';
import renderer from 'react-test-renderer';
import { ShareProfileScreen } from '../ShareProfileScreen';
import { renderWithProviders } from '../../utils/test-utils';

describe('ShareProfileScreen Snapshots', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
  };

  it('renders correctly when authenticated', () => {
    const { toJSON } = renderWithProviders(<ShareProfileScreen />, { user: mockUser });
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly when not authenticated', () => {
    const { toJSON } = renderWithProviders(<ShareProfileScreen />, { user: null });
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with custom onClose handler', () => {
    const mockOnClose = jest.fn();
    const { toJSON } = renderWithProviders(
      <ShareProfileScreen onClose={mockOnClose} />,
      { user: mockUser }
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly in loading state', () => {
    const { toJSON } = renderWithProviders(<ShareProfileScreen isLoading={true} />, { user: mockUser });
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with error state', () => {
    const { toJSON } = renderWithProviders(<ShareProfileScreen error="Test error" />, { user: mockUser });
    expect(toJSON()).toMatchSnapshot();
  });
});
