import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contact } from '../types/contact';
import { useToast } from '../contexts/ToastContext';

interface ShareContactProps {
  contact: Contact;
  variant?: 'button' | 'icon';
  size?: number;
  color?: string;
}

export const ShareContact: React.FC<ShareContactProps> = ({
  contact,
  variant = 'button',
  size = 24,
  color = '#3498db',
}) => {
  const { showToast } = useToast();

  const generateVCard = (contact: Contact) => {
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.displayName}`,
      `EMAIL:${contact.email}`,
      contact.company ? `ORG:${contact.company}` : '',
      contact.title ? `TITLE:${contact.title}` : '',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\n');

    return vCard;
  };

  const handleShare = async () => {
    try {
      const vCard = generateVCard(contact);
      const fileName = `${contact.displayName.replace(/\s+/g, '_')}.vcf`;
      
      const shareOptions = {
        title: `Share ${contact.displayName}'s Contact Info`,
        message: Platform.select({
          ios: '', // iOS includes the file content in the share
          android: `Contact information for ${contact.displayName}`, // Android shows this message
        }),
      };

      if (Platform.OS === 'ios') {
        // On iOS, we can share the vCard directly
        await Share.share({
          ...shareOptions,
          url: `data:text/vcard;base64,${Buffer.from(vCard).toString('base64')}`,
        });
      } else {
        // On Android, we'll just share the contact details as text
        const contactDetails = [
          `Name: ${contact.displayName}`,
          `Email: ${contact.email}`,
          contact.company ? `Company: ${contact.company}` : '',
          contact.title ? `Title: ${contact.title}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        await Share.share({
          ...shareOptions,
          message: contactDetails,
        });
      }

      showToast('Contact shared successfully', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to share contact',
        'error'
      );
    }
  };

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={handleShare}
        style={styles.iconButton}
        testID="share-contact-icon"
      >
        <Ionicons name="share-outline" size={size} color={color} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleShare}
      style={[styles.button, { backgroundColor: color }]}
      testID="share-contact-button"
    >
      <Ionicons name="share-outline" size={size} color="#fff" />
      <Text style={styles.buttonText}>Share Contact</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
  },
});
