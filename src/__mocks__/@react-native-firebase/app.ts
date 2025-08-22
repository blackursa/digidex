const mockFirebaseApp = {
  app: jest.fn(() => mockFirebaseApp),
  apps: [],
  initializeApp: jest.fn(() => mockFirebaseApp),
};

export default mockFirebaseApp;
