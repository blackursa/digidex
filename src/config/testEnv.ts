// Mock environment variables for testing
export const mockFirebaseConfig = {
  FIREBASE_API_KEY: 'test-api-key',
  FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: '123456789',
  FIREBASE_APP_ID: 'test-app-id',
  FIREBASE_MEASUREMENT_ID: 'test-measurement-id'
};

// Apply mock environment variables
Object.entries(mockFirebaseConfig).forEach(([key, value]) => {
  process.env[key] = value;
});
