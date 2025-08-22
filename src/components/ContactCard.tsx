import { type FC } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '../types/models';

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
}

export const ContactCard: FC<ContactCardProps> = ({ contact, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {contact.photoURL ? (
          <Image source={{ uri: contact.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{contact.name}</Text>
        {contact.company && (
          <Text style={styles.company}>{contact.company}</Text>
        )}
        {contact.title && (
          <Text style={styles.title}>{contact.title}</Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
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
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    color: '#95a5a6',
  },
});
