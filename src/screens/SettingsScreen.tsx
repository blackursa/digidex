import { type FC, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useAuthActions } from '../hooks/useAuthActions';
import {
  enableBiometrics,
  disableBiometrics,
  isBiometricsEnabled,
  isBiometricsAvailable,
} from '../services/biometrics';

export const SettingsScreen: FC = () => {
  const { user } = useAuth();
  const { handleSignOut, handleResendVerification } = useAuthActions();
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const available = await isBiometricsAvailable();
      if (!available) {
        Alert.alert('Error', 'Biometric authentication is not available on this device');
        return;
      }
      const success = await enableBiometrics({
        email: user?.email || '',
        // Note: In a real app, you wouldn't store the password
        // You'd need to ask the user to enter it again
        password: '',
      });
      if (success) {
        setBiometricsEnabled(true);
        Alert.alert('Success', 'Biometric authentication has been enabled');
      }
    } else {
      await disableBiometrics();
      setBiometricsEnabled(false);
      Alert.alert('Success', 'Biometric authentication has been disabled');
    }
  };

  return (
    <ProtectedRoute requireVerification={false}>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email Verified</Text>
            <Text style={[styles.value, user?.emailVerified ? styles.verified : styles.unverified]}>
              {user?.emailVerified ? 'Yes' : 'No'}
            </Text>
          </View>
          {!user?.emailVerified && (
            <TouchableOpacity style={styles.button} onPress={handleResendVerification}>
              <Text style={styles.buttonText}>Resend Verification Email</Text>
            </TouchableOpacity>
          )}
          <Button 
            title="Go Back"
            onPress={() => navigation.goBack()}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Biometric Login</Text>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
            />
          </View>
        </View>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
  },
  verified: {
    color: '#27ae60',
  },
  unverified: {
    color: '#e74c3c',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 'auto',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
