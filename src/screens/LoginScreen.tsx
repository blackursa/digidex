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
import { signIn, signInWithGoogle } from '../services/auth';
import {
  isBiometricsEnabled,
  getStoredCredentials,
  enableBiometrics,
} from '../services/biometrics';
import { BiometricPrompt } from '../components/BiometricPrompt';

export const LoginScreen: FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [loading, setLoading] = useState(false);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const enabled = await isBiometricsEnabled();
    setBiometricsAvailable(enabled);
    if (enabled) {
      setShowBiometrics(true);
    }
  };

  const handleBiometricSuccess = async () => {
    const credentials = await getStoredCredentials();
    if (credentials) {
      setEmail(credentials.email);
      setPassword(credentials.password);
      handleLogin(true);
    }
    setShowBiometrics(false);
  };

  const handleBiometricCancel = () => {
    setShowBiometrics(false);
  };

  const handleLogin = async (skipBiometricsSave = false) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      if ('code' in result) {
        Alert.alert('Error', result.message);
      } else if (!skipBiometricsSave && !biometricsAvailable) {
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
                  setBiometricsAvailable(true);
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
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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

  return (
    <View style={styles.container}>
      <BiometricPrompt
        visible={showBiometrics}
        onSuccess={handleBiometricSuccess}
        onCancel={handleBiometricCancel}
      />
      <Text style={styles.title}>DigiDex</Text>
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
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => handleLogin()}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Log In'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.googleButton, loading && styles.buttonDisabled]} 
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.googleButtonText]}>
          Sign in with Google
        </Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Sign Up</Text>
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
  buttonDisabled: {
    opacity: 0.7,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
});

