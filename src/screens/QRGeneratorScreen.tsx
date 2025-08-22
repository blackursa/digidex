import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput, Button, Share } from 'react-native';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { QRCodeData } from '../types/qrcode';
import { captureRef } from 'react-native-view-shot';

export function QRGeneratorScreen() {
  const [profileId, setProfileId] = useState('');
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const qrRef = React.useRef<View>(null);

  const generateQR = useCallback(() => {
    const data: QRCodeData = {
      type: 'profile',
      id: profileId,
      version: '1.0',
    };
    setQrData(data);
  }, [profileId]);

  const shareQR = useCallback(async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });
      await Share.share({
        url: uri,
        message: 'Scan this QR code to view my profile',
      });
    } catch (error) {
      console.error('Failed to share QR code:', error);
    }
  }, [qrRef]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={profileId}
        onChangeText={setProfileId}
        placeholder="Enter profile ID"
        autoCapitalize="none"
      />
      <Button title="Generate QR Code" onPress={generateQR} />
      {qrData && (
        <View style={styles.qrContainer} collapsable={false} ref={qrRef}>
          <QRCodeGenerator
            data={qrData}
            size={250}
            color="#000000"
            backgroundColor="#ffffff"
          />
          <Button title="Share QR Code" onPress={shareQR} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  qrContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
});
