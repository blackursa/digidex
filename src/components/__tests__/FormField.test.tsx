import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders label and input correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <FormField
        label="Test Label"
        placeholder="Test Placeholder"
        value=""
        onChangeText={() => {}}
      />
    );

    expect(getByText('Test Label')).toBeTruthy();
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('displays error message when provided', () => {
    const { getByText } = render(
      <FormField
        label="Test Label"
        error="Test Error"
        value=""
        onChangeText={() => {}}
      />
    );

    expect(getByText('Test Error')).toBeTruthy();
  });

  it('calls onChangeText when input changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <FormField
        label="Test Label"
        placeholder="Test Placeholder"
        value=""
        onChangeText={onChangeText}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Test Placeholder'), 'new value');
    expect(onChangeText).toHaveBeenCalledWith('new value');
  });

  it('applies multiline styles when multiline prop is true', () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Test Label"
        placeholder="Test Placeholder"
        value=""
        onChangeText={() => {}}
        multiline
        numberOfLines={4}
      />
    );

    const input = getByPlaceholderText('Test Placeholder');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });

  it('applies error styles when error is provided', () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Test Label"
        placeholder="Test Placeholder"
        value=""
        onChangeText={() => {}}
        error="Test Error"
      />
    );

    const input = getByPlaceholderText('Test Placeholder');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: '#e74c3c' })
    );
  });
});
