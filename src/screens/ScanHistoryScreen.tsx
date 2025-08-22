import React, { useState, useEffect, type FC } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScanHistoryItem } from '../components/ScanHistoryItem';
import { PaginatedList } from '../components/PaginatedList';
import { useScanHistory } from '../hooks/useScanHistory';
import type { ScanHistoryItem as ScanHistoryItemType } from '../types/scanHistory';
import { getScanHistory, clearScanHistory, type ScanRecord } from '../services/scanHistory';

export const ScanHistoryScreen: FC = () => {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const records = await getScanHistory();
    setHistory(records);
  };

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearScanHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ScanRecord }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Ionicons 
          name={item.type === 'profile' ? 'person' : 'card'} 
          size={24} 
          color="#666"
        />
        <View style={styles.itemText}>
          <Text style={styles.name}>
            {item.data.name || 'Unknown Contact'}
          </Text>
          {item.data.email && (
            <Text style={styles.email}>{item.data.email}</Text>
          )}
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  const loadMore = async () => {
    // implement load more logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={24} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="scan-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No scan history</Text>
        </View>
      ) : (
        <PaginatedList<ScanHistoryItemType>
          data={history}
          renderItem={(item) => <ScanHistoryItem item={item} />}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
