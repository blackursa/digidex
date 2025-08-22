import { type FC, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchContactRequests,
  acceptContactRequest,
  rejectContactRequest,
} from '../services/firestore';
import type { ContactRequest } from '../types/models';
import type { NavigationProps } from '../types/navigation';

export const ContactRequestsScreen: FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const fetchedRequests = await fetchContactRequests(user.uid);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      Alert.alert('Error', 'Failed to load contact requests');
    }
  }, [user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [loadRequests]);

  const handleAccept = async (request: ContactRequest) => {
    if (!user?.uid) return;
    try {
      await acceptContactRequest(user.uid, request.id);
      Alert.alert('Success', 'Contact request accepted');
      loadRequests();
    } catch (error) {
      console.error('Error accepting contact request:', error);
      Alert.alert('Error', 'Failed to accept contact request');
    }
  };

  const handleReject = async (request: ContactRequest) => {
    if (!user?.uid) return;
    try {
      await rejectContactRequest(user.uid, request.id);
      Alert.alert('Success', 'Contact request rejected');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting contact request:', error);
      Alert.alert('Error', 'Failed to reject contact request');
    }
  };

  const renderItem = ({ item }: { item: ContactRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.senderName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.senderName}</Text>
          <Text style={styles.email}>{item.senderEmail}</Text>
          {item.message && (
            <Text style={styles.message}>{item.message}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item)}
        >
          <Ionicons name="checkmark-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item)}
        >
          <Ionicons name="close-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={48} color="#95a5a6" />
              <Text style={styles.emptyText}>No contact requests</Text>
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
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  requestInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#95a5a6',
  },
});
