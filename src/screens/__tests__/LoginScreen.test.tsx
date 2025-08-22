import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { useNavigation } from '@react-navigation/native';

jest.mock('@firebase/auth');
jest.mock('@react-navigation/native');

describe('LoginScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (signInWithEmailAndPassword as jest.Mock).mockClear();
  });

  it('validates email format', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const submitButton = getByText('Login');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email')).toBeTruthy();
      expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  it('validates password requirements', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Password must be at least 8 characters long')).toBeTruthy();
      expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  it('handles successful login', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Login');

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    });

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'StrongPass1!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'StrongPass1!'
      );
    });
  });

  it('handles login error', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Login');

    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: 'Invalid password',
    });

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'WrongPass1!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Invalid password')).toBeTruthy();
    });
  });

  it('navigates to signup screen', () => {
    const { getByText } = render(<LoginScreen />);
    
    const signupLink = getByText('Sign up');
    fireEvent.press(signupLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUp');
  });
});
