import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProps } from '../types/navigation';
import { verifyEmail } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

export const EmailVerificationScreen: FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyEmailCode = async () => {
      // In a real app, you would get this from the deep link URL
      const code = 'test-code';
      
      try {
        const result = await verifyEmail(code);
        if (result === true) {
          setVerified(true);
        } else {
          Alert.alert('Error', result.message);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmailCode();
  }, []);

  const handleContinue = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Verifying your email...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name={verified ? 'checkmark-circle' : 'close-circle'}
        size={80}
        color={verified ? '#2ecc71' : '#e74c3c'}
        style={styles.icon}
      />
      <Text style={styles.title}>
        {verified ? 'Email Verified!' : 'Verification Failed'}
      </Text>
      <Text style={styles.description}>
        {verified
          ? 'Your email has been successfully verified. You can now sign in to your account.'
          : 'We were unable to verify your email. Please try again or request a new verification link.'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>
          {verified ? 'Continue to Login' : 'Back to Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
