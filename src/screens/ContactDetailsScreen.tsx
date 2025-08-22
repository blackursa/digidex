import { type FC } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { removeContact } from '../services/firestore';
import type { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'ContactDetails'>;

export const ContactDetailsScreen: FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { user } = useAuth();
  const { contact } = route.params;

  const handleRemoveContact = async () => {
    try {
      if (!user?.uid) return;

      Alert.alert(
        'Remove Contact',
        'Are you sure you want to remove this contact?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              await removeContact(user.uid, contact.id);
              navigation.goBack();
              Alert.alert('Success', 'Contact removed successfully');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error removing contact:', error);
      Alert.alert('Error', 'Failed to remove contact');
    }
  };

  const handleCall = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleEmail = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  return (
    <ProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {contact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{contact.name}</Text>
          {contact.title && (
            <Text style={styles.title}>{contact.title}</Text>
          )}
          {contact.company && (
            <Text style={styles.company}>{contact.company}</Text>
          )}
        </View>

        <View style={styles.section}>
          {contact.phone && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCall}
            >
              <Ionicons name="call-outline" size={24} color="#2c3e50" />
              <Text style={styles.actionText}>{contact.phone}</Text>
            </TouchableOpacity>
          )}

          {contact.email && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEmail}
            >
              <Ionicons name="mail-outline" size={24} color="#2c3e50" />
              <Text style={styles.actionText}>{contact.email}</Text>
            </TouchableOpacity>
          )}
        </View>

        {contact.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{contact.notes}</Text>
          </View>
        )}

        {contact.tags && contact.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {contact.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemoveContact}
        >
          <Ionicons name="trash-outline" size={24} color="#ffffff" />
          <Text style={styles.removeButtonText}>Remove Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  company: {
    fontSize: 16,
    color: '#95a5a6',
  },
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  notes: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  tag: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 5,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 14,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
