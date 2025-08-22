declare module 'expo-status-bar' {
  export type StatusBarStyle = 'auto' | 'inverted' | 'light' | 'dark';
  export interface StatusBarProps {
    style?: StatusBarStyle;
  }
  export const StatusBar: React.FC<StatusBarProps>;
}

declare module '@env' {
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}
