import { type FC } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';

interface LoadingOverlayProps {
  message?: string | null;
  error?: string | null;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({ message, error }) => {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.container, { minHeight: height * 0.2 }]}>
      {!error && <ActivityIndicator size="large" color="#007AFF" />}
      {message && <Text style={styles.message}>{message}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  error: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
