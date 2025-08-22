import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRCodeData } from '../types/qrcode';

interface QRCodeGeneratorProps {
  data: QRCodeData;
  size?: number;
  color?: string;
  backgroundColor?: string;
  onError?: (error: Error) => void;
}

export function QRCodeGenerator({
  data,
  size = 200,
  color = '#000000',
  backgroundColor = '#ffffff',
  onError,
}: QRCodeGeneratorProps) {
  const [isValid, setIsValid] = useState(true);

  const handleError = useCallback((error: Error) => {
    setIsValid(false);
    onError?.(error);
  }, [onError]);

  const qrValue = JSON.stringify(data);

  if (!isValid) {
    return null;
  }

  return (
    <View style={styles.container}>
      <QRCode
        value={qrValue}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
        onError={handleError}
        quietZone={10}
        enableLinearGradient={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
