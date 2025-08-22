import { type FC, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components/SearchBar';
import { ContactCard } from '../components/ContactCard';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { getContacts, removeContact } from '../services/firestore';
import type { Contact } from '../types/models';
import type { NavigationProps } from '../types/navigation';

export const ContactsScreen: FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: contacts,
    loading,
    execute: fetchContacts,
  } = useApi<Contact[]>(getContacts, {
    onMount: true,
    params: [user?.uid],
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts(user?.uid);
    setRefreshing(false);
  }, [fetchContacts, user?.uid]);

  const handleRemoveContact = useCallback(
    async (contactId: string) => {
      try {
        if (!user?.uid) return;

        await removeContact(user.uid, contactId);
        await fetchContacts(user.uid);
        Alert.alert('Success', 'Contact removed successfully');
      } catch (error) {
        console.error('Error removing contact:', error);
        Alert.alert('Error', 'Failed to remove contact');
      }
    },
    [fetchContacts, user?.uid]
  );

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    if (!searchQuery) return contacts;

    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.title?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const renderItem = useCallback(
    ({ item: contact }: { item: Contact }) => (
      <ContactCard
        contact={contact}
        onPress={() => {
          Alert.alert(
            'Contact Options',
            'What would you like to do?',
            [
              {
                text: 'View Details',
                onPress: () => navigation.navigate('ContactDetails', { contact }),
              },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () =>
                  Alert.alert(
                    'Remove Contact',
                    'Are you sure you want to remove this contact?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => handleRemoveContact(contact.id),
                      },
                    ]
                  ),
              },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    ),
    [navigation, handleRemoveContact]
  );

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        <FlatList
          data={filteredContacts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={loading ? 'sync' : 'people-outline'}
                size={48}
                color="#95a5a6"
              />
              <Text style={styles.emptyText}>
                {loading
                  ? 'Loading contacts...'
                  : searchQuery
                  ? 'No contacts found'
                  : 'No contacts yet'}
              </Text>
              {!loading && !searchQuery && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate('QRScanner')}
                >
                  <Text style={styles.addButtonText}>Scan QR Code to Add</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
