import React, { useEffect } from 'react';
import { StyleSheet, View, Animated, AccessibilityInfo } from 'react-native';

type ScanStatus = 'scanning' | 'success' | 'error' | 'retry';

interface ScanStatusOverlayProps {
  status: ScanStatus;
}

export const ScanStatusOverlay: React.FC<ScanStatusOverlayProps> = ({ status }) => {
  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    // Announce status changes
    switch (status) {
      case 'success':
        AccessibilityInfo.announceForAccessibility('Scan successful');
        break;
      case 'error':
        AccessibilityInfo.announceForAccessibility('Scan failed');
        break;
      case 'retry':
        AccessibilityInfo.announceForAccessibility('Retrying scan');
        break;
    }

    // Start animation for scanning state
    if (status === 'scanning') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'retry':
        return '#FFC107';
      default:
        return '#2196F3';
    }
  };

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View 
      style={styles.container} 
      accessibilityRole="alert"
      accessibilityState={{ busy: status === 'scanning' }}
    >
      <Animated.View
        testID="status-overlay"
        style={[
          styles.overlay,
          {
            backgroundColor: getStatusColor(),
            opacity,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
