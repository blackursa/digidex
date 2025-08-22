import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Toast } from '../Toast';

jest.useFakeTimers();

describe('Toast', () => {
  it('renders message when visible', () => {
    const { getByText } = render(
      <Toast
        visible={true}
        message="Test Message"
        onHide={() => {}}
      />
    );

    expect(getByText('Test Message')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <Toast
        visible={false}
        message="Test Message"
        onHide={() => {}}
      />
    );

    expect(queryByText('Test Message')).toBeNull();
  });

  it('calls onHide when close button is pressed', () => {
    const onHide = jest.fn();
    const { getByTestId } = render(
      <Toast
        visible={true}
        message="Test Message"
        onHide={onHide}
      />
    );

    fireEvent.press(getByTestId('toast-close-button'));
    expect(onHide).toHaveBeenCalled();
  });

  it('auto-hides after duration', () => {
    const onHide = jest.fn();
    render(
      <Toast
        visible={true}
        message="Test Message"
        duration={3000}
        onHide={onHide}
      />
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onHide).toHaveBeenCalled();
  });

  it('shows different icons based on type', () => {
    const { getByTestId, rerender } = render(
      <Toast
        visible={true}
        message="Test Message"
        type="success"
        onHide={() => {}}
      />
    );

    expect(getByTestId('toast-icon').props.name).toBe('checkmark-circle-outline');

    rerender(
      <Toast
        visible={true}
        message="Test Message"
        type="error"
        onHide={() => {}}
      />
    );

    expect(getByTestId('toast-icon').props.name).toBe('alert-circle-outline');

    rerender(
      <Toast
        visible={true}
        message="Test Message"
        type="info"
        onHide={() => {}}
      />
    );

    expect(getByTestId('toast-icon').props.name).toBe('information-circle-outline');
  });

  it('cleans up timeout on unmount', () => {
    const onHide = jest.fn();
    const { unmount } = render(
      <Toast
        visible={true}
        message="Test Message"
        duration={3000}
        onHide={onHide}
      />
    );

    unmount();
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onHide).not.toHaveBeenCalled();
  });
});
