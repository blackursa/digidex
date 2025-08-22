import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@firebase/auth';

jest.mock('@firebase/auth');

const TestComponent = () => {
  const { user, loading, signIn, signUp, logout } = useAuth();
  return (
    <>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <button onPress={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onPress={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onPress={logout}>Logout</button>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        callback(null);
        return () => {};
      }),
    });
  });

  it('provides initial auth state', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('loading').textContent).toBe('false');
    expect(JSON.parse(getByTestId('user').textContent)).toBe(null);
  });

  it('handles successful sign in', async () => {
    const mockUser = { uid: 'user123', email: 'test@example.com' };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });

    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByText('Sign In').props.onPress();
    });

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      );
    });
  });

  it('handles sign in error', async () => {
    const error = new Error('Invalid credentials');
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(error);

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByText('Sign In').props.onPress();
    });

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
    });
  });

  it('handles successful sign up', async () => {
    const mockUser = { uid: 'user123', email: 'test@example.com' };
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByText('Sign Up').props.onPress();
    });

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      );
    });
  });

  it('handles successful logout', async () => {
    (signOut as jest.Mock).mockResolvedValueOnce(undefined);

    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByText('Logout').props.onPress();
    });

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(JSON.parse(getByTestId('user').textContent)).toBe(null);
    });
  });

  it('handles auth state changes', async () => {
    const mockUser = { uid: 'user123', email: 'test@example.com' };
    let authStateCallback: (user: any) => void;

    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        authStateCallback = callback;
        return () => {};
      }),
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      authStateCallback(mockUser);
    });

    await waitFor(() => {
      const userState = JSON.parse(getByTestId('user').textContent);
      expect(userState.uid).toBe(mockUser.uid);
      expect(userState.email).toBe(mockUser.email);
    });
  });
});
