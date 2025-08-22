import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint,
  orderBy,
  Timestamp,
} from '@firebase/firestore';
import { db } from './firebase';
import type { Contact, UserProfile, ContactRequest } from '../types/models';

// Helper function to convert Firestore timestamp to Date
const convertTimestamps = <T extends { createdAt: any; updatedAt: any }>(
  data: T
): T => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// User Profile API
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return convertTimestamps(docSnap.data() as UserProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Contacts API
export async function removeContact(userId: string, contactId: string): Promise<void> {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    await deleteDoc(contactRef);
  } catch (error) {
    console.error('Error removing contact:', error);
    throw new Error('Failed to remove contact');
  }
}

export const getContacts = async (userId: string): Promise<Contact[]> => {
  try {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ];
    
    const q = query(collection(db, 'contacts'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() } as Contact));
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
};

export const getContact = async (contactId: string): Promise<Contact | null> => {
  try {
    const docRef = doc(db, 'contacts', contactId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return convertTimestamps({ id: docSnap.id, ...docSnap.data() } as Contact);
  } catch (error) {
    console.error('Error getting contact:', error);
    throw error;
  }
};

export const createContact = async (
  userId: string,
  data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Contact> => {
  try {
    const contactRef = doc(collection(db, 'contacts'));
    const now = serverTimestamp();
    const contact: Omit<Contact, 'id'> = {
      ...data,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(contactRef, contact);
    return { ...contact, id: contactRef.id };
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
};

export const updateContact = async (
  contactId: string,
  data: Partial<Contact>
): Promise<void> => {
  try {
    const docRef = doc(db, 'contacts', contactId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'contacts', contactId));
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// Contact Requests API
export const getContactRequests = async (userId: string): Promise<ContactRequest[]> => {
  try {
    const constraints: QueryConstraint[] = [
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    ];
    
    const q = query(collection(db, 'contactRequests'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const contacts = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => convertTimestamps({
      ...convertTimestamps(doc.data() as ContactRequest),
      id: doc.id
    }));
    return contacts;
  } catch (error) {
    console.error('Error getting contact requests:', error);
    throw error;
  }
};

export const createContactRequest = async (
  fromUserId: string,
  toUserId: string,
  message?: string
): Promise<ContactRequest> => {
  try {
    const requestRef = doc(collection(db, 'contactRequests'));
    const now = Timestamp.now();
    const request: Omit<ContactRequest, 'id'> = {
      fromUserId,
      toUserId,
      message,
      status: 'pending',
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
    
    await setDoc(requestRef, request);
    return { ...request, id: requestRef.id };
  } catch (error) {
    console.error('Error creating contact request:', error);
    throw error;
  }
};

export const updateContactRequest = async (
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<void> => {
  try {
    const docRef = doc(db, 'contactRequests', requestId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating contact request:', error);
    throw error;
  }
};
