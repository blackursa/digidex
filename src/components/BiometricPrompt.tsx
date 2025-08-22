import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  isBiometricsAvailable,
  getBiometricsSupportType,
  authenticateWithBiometrics,
} from '../services/biometrics';

interface BiometricPromptProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricPrompt: FC<BiometricPromptProps> = ({
  visible,
  onSuccess,
  onCancel,
}) => {
  const [biometricType, setBiometricType] = useState<string>('Biometrics');
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const checkBiometrics = async () => {
      const isAvailable = await isBiometricsAvailable();
      if (isAvailable) {
        const type = await getBiometricsSupportType();
        setBiometricType(type);
      }
      setAvailable(isAvailable);
      setLoading(false);

      if (isAvailable && visible) {
        handleAuthenticate();
      }
    };

    checkBiometrics();
  }, [visible]);

  const handleAuthenticate = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      onSuccess();
    }
  };

  if (!visible || !available) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.promptContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#3498db" />
          ) : (
            <>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Ionicons
                name="lock-closed"
                size={50}
                color="#3498db"
                style={styles.icon}
              />
              <Text style={styles.title}>Sign in with {biometricType}</Text>
              <Text style={styles.description}>
                Use {biometricType} for faster, secure access to your account
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleAuthenticate}
              >
                <Text style={styles.buttonText}>
                  Authenticate with {biometricType}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>
                  Use Password Instead
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  icon: {
    marginVertical: 20,
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
    marginBottom: 20,
    color: '#666',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});
