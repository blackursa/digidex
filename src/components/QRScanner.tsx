import { useState, type FC } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from './CameraView';
import { getBarCodeScannerModule, getBarCodeTypes } from '../utils/qrScanner';
import { triggerHaptic } from '../utils/haptics';

interface QRScannerProps {
  onBatchPress?: () => void;
  onScan: (data: string) => void;
  onClose: () => void;
  onHistoryPress: () => void;
}

export function QRScanner({ onScan, onClose, onHistoryPress, onBatchPress }: QRScannerProps) {
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const BarCodeScanner = getBarCodeScannerModule();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    await triggerHaptic('impact');
    onScan(data);
  };

  return (
    <CameraView onClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.guideText}>Position QR code within frame</Text>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onHistoryPress}
          accessibilityLabel="View scan history"
        >
          <Ionicons name="time-outline" size={24} color="white" />
          <Text style={styles.controlText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setTorch(!torch)}
        >
          <Ionicons
            name={torch ? 'flash' : 'flash-off'}
            size={24}
            color="white"
          />
          <Text style={styles.controlText}>Flash</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
          <Ionicons name="close-circle" size={24} color="white" />
          <Text style={styles.controlText}>Close</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setScanned(false)}
          >
            <Ionicons name="scan" size={24} color="white" />
            <Text style={styles.controlText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </CameraView>
  );
};

const CORNER_SIZE = 20;
const BORDER_WIDTH = 3;

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
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: Dimensions.get('window').width,
  },
  focusedContainer: {
    flex: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
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
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#00ff00',
    borderWidth: BORDER_WIDTH,
  },
  topLeft: {
    top: -BORDER_WIDTH,
    left: -BORDER_WIDTH,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -BORDER_WIDTH,
    right: -BORDER_WIDTH,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -BORDER_WIDTH,
    left: -BORDER_WIDTH,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -BORDER_WIDTH,
    right: -BORDER_WIDTH,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  guideText: {
    color: 'white',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});
