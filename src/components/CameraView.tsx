import { type FC, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { getCameraModule, requestCameraPermissions } from '../utils/qrScanner';

interface CameraViewProps {
  onClose?: () => void;
  children?: React.ReactNode;
}

export const CameraView: FC<CameraViewProps> = ({ onClose, children }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const Camera = getCameraModule();

  useEffect(() => {
    const getPermissions = async () => {
      const granted = await requestCameraPermissions();
      setHasPermission(granted);
    };

    getPermissions();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false || !Camera) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        {onClose && (
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera.Camera
        style={styles.camera}
        type="back"
        flashMode="off"
      >
        {children}
      </Camera.Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
