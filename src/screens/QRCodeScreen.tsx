import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { doc, getDoc } from '@firebase/firestore';
import { db } from '../config/firebase';
import { LoadingState } from '../components/LoadingState';

interface Profile {
  displayName: string;
  company?: string;
  title?: string;
  qrCode: string;
}

export const QRCodeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (!profileDoc.exists()) {
          throw new Error('Profile not found');
        }
        setProfile(profileDoc.data() as Profile);
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : 'Failed to load profile',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigation, showToast]);

  if (loading) {
    return <LoadingState message="Loading QR code..." />;
  }

  if (!user || !profile) {
    return null;
  }

  // Create a secure QR code string that only includes necessary data
  const qrData = `${user.uid}_${profile.qrCode}`;

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <QRCodeSVG
          value={qrData}
          size={250}
          level="H"
          includeMargin={true}
        />
      </View>
      <Text style={styles.name}>{profile.displayName}</Text>
      {profile.company && <Text style={styles.details}>{profile.company}</Text>}
      {profile.title && <Text style={styles.details}>{profile.title}</Text>}
      <Text style={styles.hint}>Show this QR code to share your contact info</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  }
});
