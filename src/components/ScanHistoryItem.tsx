import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { QRCodeData } from '../types/qrcode';

interface ScanHistoryItemProps {
  item: {
    id: string;
    timestamp: number;
    data: QRCodeData;
  };
}

export function ScanHistoryItem({ item }: ScanHistoryItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>
          {format(item.timestamp, 'MMM d, yyyy h:mm a')}
        </Text>
        <Text style={styles.type}>{item.data.type}</Text>
      </View>
      <Text style={styles.id}>{item.data.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  type: {
    fontSize: 12,
    color: '#999999',
    textTransform: 'uppercase',
  },
  id: {
    fontSize: 16,
    color: '#000000',
  },
});
