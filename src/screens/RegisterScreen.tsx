import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type {
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { PasswordInput } from '../components/PasswordInput';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProps } from '../types/navigation';
import { signUp, signInWithGoogle } from '../services/auth';
import { validatePassword, validateEmail } from '../utils/validation';

export const RegisterScreen: FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (password) {
      const { errors } = validatePassword(password);
      setPasswordErrors(errors);
      
      // Calculate password strength (0-100)
      const strength = Math.min(
        100,
        Math.max(
          0,
          (password.length * 10) +
          (/[A-Z]/.test(password) ? 20 : 0) +
          (/[a-z]/.test(password) ? 20 : 0) +
          (/\d/.test(password) ? 20 : 0) +
          (/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 20 : 0)
        )
      );
      setPasswordStrength(strength);
    } else {
      setPasswordErrors([]);
      setPasswordStrength(0);
    }
  }, [password]);

  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return '#ff4444';
    if (strength < 60) return '#ffbb33';
    if (strength < 80) return '#00C851';
    return '#007E33';
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      Alert.alert('Error', errors.join('\n'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password);
      if ('code' in result) {
        Alert.alert('Error', result.message);
      } else {
        // Registration successful, navigate to home or show success message
        Alert.alert('Success', 'Account created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if ('code' in result) {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <Text style={styles.label}>Password</Text>
        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          hasError={passwordErrors.length > 0}
          editable={!loading}
          style={styles.input}
        />
        <Text style={styles.label}>Confirm Password</Text>
        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          hasError={password !== confirmPassword && confirmPassword.length > 0}
          editable={!loading}
          style={styles.input}
        />
      </View>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.googleButton, loading && styles.buttonDisabled]} 
        onPress={handleGoogleSignUp}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.googleButtonText]}>
          Sign up with Google
        </Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    color: '#2c3e50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 2,
  },
  strengthContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
