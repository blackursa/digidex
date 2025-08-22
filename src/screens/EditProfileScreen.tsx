import { type FC, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { FormField } from '../components/FormField';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { getUserProfile, updateUserProfile } from '../services/firestore';
import { uploadProfileImage } from '../services/storage';
import {
  validateLinkedIn,
  validateTwitter,
  validateGitHub,
  validateWebsite,
} from '../utils/validation';
import type { UserProfile } from '../types/models';
import type { NavigationProps } from '../types/navigation';

export const EditProfileScreen: FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: profile, loading } = useApi<UserProfile | null>(getUserProfile, {
    onMount: true,
    params: [user?.uid],
    onSuccess: (data) => {
      if (data) {
        setFormData({
          displayName: data.displayName || '',
          company: data.company || '',
          title: data.title || '',
          bio: data.bio || '',
          phone: data.phone || '',
          website: data.website || '',
          socialLinks: {
            linkedin: data.socialLinks?.linkedin || '',
            twitter: data.socialLinks?.twitter || '',
            github: data.socialLinks?.github || '',
          },
        });
      }
    },
  });

  const handleImagePick = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to change your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        try {
          if (!user?.uid) return;
          
          const photoURL = await uploadProfileImage(
            user.uid,
            result.assets[0].uri
          );
          
          await updateUserProfile(user.uid, { photoURL });
          setFormData((prev) => ({ ...prev, photoURL }));
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload profile image');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, [user?.uid]);

  const validateForm = () => {
    const socialValidation = {
      linkedin: validateLinkedIn(formData.socialLinks?.linkedin || ''),
      twitter: validateTwitter(formData.socialLinks?.twitter || ''),
      github: validateGitHub(formData.socialLinks?.github || ''),
    };

    const websiteValidation = validateWebsite(formData.website || '');
    const newErrors: Record<string, string> = {};

    if (!formData.displayName?.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!websiteValidation.isValid) {
      newErrors.website = websiteValidation.error || 'Invalid website URL';
    }

    if (!socialValidation.linkedin.isValid) {
      newErrors.linkedin = socialValidation.linkedin.error || 'Invalid LinkedIn URL';
    }

    if (!socialValidation.twitter.isValid) {
      newErrors.twitter = socialValidation.twitter.error || 'Invalid Twitter handle';
    }

    if (!socialValidation.github.isValid) {
      newErrors.github = socialValidation.github.error || 'Invalid GitHub URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    try {
      if (!user?.uid) return;
      if (!validateForm()) return;

      await updateUserProfile(user.uid, formData);
      navigation.goBack();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  }, [user?.uid, formData, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleImagePick}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : formData.photoURL ? (
              <Image
                source={{ uri: formData.photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#95a5a6" />
              </View>
            )}
          </TouchableOpacity>

          <FormField
            label="Display Name"
            value={formData.displayName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, displayName: text }))
            }
            error={errors.displayName}
            placeholder="Your name"
          />

          <FormField
            label="Company"
            value={formData.company}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, company: text }))
            }
            placeholder="Your company"
          />

          <FormField
            label="Title"
            value={formData.title}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, title: text }))
            }
            placeholder="Your job title"
          />

          <FormField
            label="Bio"
            value={formData.bio}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, bio: text }))
            }
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />

          <FormField
            label="Phone"
            value={formData.phone}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, phone: text }))
            }
            placeholder="Your phone number"
            keyboardType="phone-pad"
          />

          <FormField
            label="Website"
            value={formData.website}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, website: text }))
            }
            placeholder="https://your-website.com"
            keyboardType="url"
            error={errors.website}
          />

          <View style={styles.section}>
            <FormField
              label="LinkedIn"
              value={formData.socialLinks?.linkedin}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, linkedin: text },
                }))
              }
              placeholder="https://linkedin.com/in/username"
              error={errors.linkedin}
            />

            <FormField
              label="Twitter"
              value={formData.socialLinks?.twitter}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, twitter: text },
                }))
              }
              placeholder="@username"
              error={errors.twitter}
            />

            <FormField
              label="GitHub"
              value={formData.socialLinks?.github}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, github: text },
                }))
              }
              placeholder="https://github.com/username"
              error={errors.github}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={24} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  section: {
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
