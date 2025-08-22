import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import type { NavigationProps } from '../types/navigation';
import {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
  resetPassword,
  sendVerificationEmail,
} from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  enableBiometrics,
  disableBiometrics,
  isBiometricsEnabled,
} from '../services/biometrics';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();

  const handleSignIn = async (
    email: string,
    password: string,
    skipBiometricsSave = false
  ) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      if ('code' in result) {
        Alert.alert('Error', result.message);
      } else if (!skipBiometricsSave) {
        const biometricsEnabled = await isBiometricsEnabled();
        if (!biometricsEnabled) {
          Alert.alert(
            'Enable Biometric Login',
            'Would you like to enable biometric authentication for faster login?',
            [
              {
                text: 'No Thanks',
                style: 'cancel',
              },
              {
                text: 'Enable',
                onPress: async () => {
                  const success = await enableBiometrics({
                    email,
                    password,
                  });
                  if (success) {
                    Alert.alert(
                      'Success',
                      'Biometric authentication has been enabled'
                    );
                  }
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password);
      if ('code' in result) {
        Alert.alert('Error', result.message);
      } else {
        Alert.alert(
          'Success',
          'Account created! Please verify your email address.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if ('code' in result) {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      await disableBiometrics();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result === true) {
        Alert.alert(
          'Success',
          'Password reset instructions have been sent to your email',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to verify your email');
      return;
    }

    setLoading(true);
    try {
      const result = await sendVerificationEmail(user);
      if (result === true) {
        Alert.alert(
          'Success',
          'Verification email has been sent. Please check your inbox.'
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignIn,
    handleSignUp,
    handleGoogleSignIn,
    handleSignOut,
    handleResetPassword,
    handleResendVerification,
  };
};
