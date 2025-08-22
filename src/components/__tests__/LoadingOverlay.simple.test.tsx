import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders loading message', () => {
    const { getByText } = render(
      <LoadingOverlay message="Loading..." />
    );
    
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders error message', () => {
    const { getByText } = render(
      <LoadingOverlay error="Something went wrong" />
    );
    
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('shows loading indicator when no error is present', () => {
    const { getByTestId } = render(
      <LoadingOverlay message="Loading..." />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('does not show loading indicator when error is present', () => {
    const { queryByTestId } = render(
      <LoadingOverlay error="Error" />
    );
    
    expect(queryByTestId('loading-indicator')).toBeNull();
  });

  it('shows both message and error when both are provided', () => {
    const { getByText } = render(
      <LoadingOverlay 
        message="Loading..." 
        error="Something went wrong" 
      />
    );
    
    expect(getByText('Loading...')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
