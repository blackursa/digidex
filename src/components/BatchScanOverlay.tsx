import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BatchScanOverlayProps {
  count: number;
  onFinish: () => void;
  onCancel: () => void;
}

export function BatchScanOverlay({ count, onFinish, onCancel }: BatchScanOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Batch Scan Mode</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>QR Codes Scanned</Text>
      </View>
      <TouchableOpacity onPress={onFinish} style={styles.finishButton}>
        <Text style={styles.finishText}>Finish Batch</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
    marginVertical: 16,
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  finishButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
