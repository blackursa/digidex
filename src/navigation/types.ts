import type { Contact } from '../types/models';

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EmailVerification: undefined;

  // Main Stack
  MainTabs: undefined;
  Home: undefined;
  Settings: undefined;
  Contacts: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ShareProfile: undefined;
  AddContact: undefined;
  ContactDetails: { contact: Contact };
  ContactRequests: undefined;
  QRScanner: undefined;
};
