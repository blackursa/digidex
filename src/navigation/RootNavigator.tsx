import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
// Auth screens will be implemented later
const LoginScreen = () => null;
const RegisterScreen = () => null;
const ForgotPasswordScreen = () => null;
const EmailVerificationScreen = () => null;
import { ContactsScreen } from '../screens/ContactsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AddContactScreen } from '../screens/AddContactScreen';
import { ShareProfileScreen } from '../screens/ShareProfileScreen';
import { ContactDetailsScreen } from '../screens/ContactDetailsScreen';
import { ContactRequestsScreen } from '../screens/ContactRequestsScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';

// Context
import { useAuth } from '../contexts/AuthContext';

// Types
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Scan" component={QRScannerScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'default'
      }}>
      {!user ? (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        </>
      ) : (
        // App screens
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="AddContact" 
            component={AddContactScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="ContactDetails" 
            component={ContactDetailsScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="ShareProfile" 
            component={ShareProfileScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="ContactRequests" 
            component={ContactRequestsScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
