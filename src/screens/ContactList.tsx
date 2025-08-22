import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { getContacts } from '../services/firestore';

export interface Contact {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

interface Props {
  navigation?: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const ContactList: React.FC<Props> = ({ navigation }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<'all' | 'email' | 'phone'>('all');

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load contacts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const filteredContacts = contacts
    .filter(contact => {
      const matchesSearch = contact.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      switch (filter) {
        case 'email':
          return matchesSearch && contact.email;
        case 'phone':
          return matchesSearch && contact.phone;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      const comparison = a.displayName.localeCompare(b.displayName);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error: {error.message}</Text>
        <TouchableOpacity onPress={loadContacts} style={styles.retryButton}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search contacts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('all')}>
          <Text style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('email')}>
          <Text style={[styles.filterButton, filter === 'email' && styles.activeFilter]}>With Email</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('phone')}>
          <Text style={[styles.filterButton, filter === 'phone' && styles.activeFilter]}>With Phone</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          <Text style={styles.sortButton}>{sortOrder === 'asc' ? '↑' : '↓'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation?.navigate('ContactDetails', { contact: item })}
            style={styles.contactItem}
          >
            <Text style={styles.contactName}>{item.displayName}</Text>
            {item.email && <Text style={styles.contactDetail}>{item.email}</Text>}
            {item.phone && <Text style={styles.contactDetail}>{item.phone}</Text>}
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text>No contacts found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  filterButton: {
    padding: 5,
  },
  activeFilter: {
    fontWeight: 'bold',
    color: 'blue',
  },
  sortButton: {
    fontSize: 20,
  },
  contactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
});
