import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, setDoc } from '@firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LoadingState } from '../components/LoadingState';
import { Contact } from '../types/contact';

export const AddContactScreen = () => {
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const contact = (route.params as { contact: Contact }).contact;

  const handleAddContact = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Create contact document
      const contactRef = doc(db, 'contacts', `${user.uid}_${contact.id}`);
      const now = new Date();
      
      await setDoc(contactRef, {
        userId: user.uid,
        contactId: contact.id,
        displayName: contact.displayName,
        email: contact.email,
        company: contact.company || null,
        title: contact.title || null,
        photoURL: contact.photoURL || null,
        qrCode: contact.qrCode,
        createdAt: now,
        updatedAt: now
      });

      showToast('Contact added successfully', 'success');
      navigation.navigate('Contacts');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to add contact',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Adding contact..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {contact.photoURL ? (
          <Image
            source={{ uri: contact.photoURL }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initials}>
              {contact.displayName
                .split(' ')
                .map((n: string) => n[0])
                .join('')}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{contact.displayName}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{contact.email}</Text>
        </View>

        {contact.company && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{contact.company}</Text>
          </View>
        )}

        {contact.title && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{contact.title}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddContact}
        >
          <Text style={styles.buttonText}>Add Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  initialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  initials: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  value: {
    flex: 2,
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  cancelButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
