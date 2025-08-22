import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { Contact } from './models';

export type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Contacts: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EmailVerification: {
    code?: string;
  };

  // Main navigation
  MainTabs: undefined;
  Settings: undefined;
  EditProfile: undefined;

  // Contact management
  Contacts: undefined;
  ContactDetails: {
    contact: Contact;
  };

  // QR code features
  QRCode: undefined;
  QRScanner: undefined;
  ScanQR: undefined;
  ScanHistory: undefined;
  AddContact: {
    contact: Contact;
  };
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
