import { type FC } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import type { NavigationProps } from '../types/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requireVerification = true,
}) => {
  const { user, isEmailVerified } = useAuth();
  const navigation = useNavigation<NavigationProps>();

  if (!user) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    return null;
  }

  if (requireVerification && !isEmailVerified) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Email Verification Required</Text>
        <Text style={styles.message}>
          Please verify your email address to access this feature.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EmailVerification', {})}
        >
          <Text style={styles.buttonText}>Verify Email</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
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
});
