/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',  // Changed to jsdom for React Native compatibility
  setupFiles: [
    '<rootDir>/src/setupTests.ts'
  ],
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|expo|@react-native|@expo)'
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '\.svg$': '<rootDir>/src/__mocks__/svgMock.js',
    '^react-native$': 'react-native-web'
  },
  verbose: true,
  testTimeout: 5000,  // Reduced timeout to catch hanging tests
  maxWorkers: 1,  // Single worker for better stability
  forceExit: true, // Force exit after tests complete
  detectOpenHandles: true, // Help identify hanging processes
  injectGlobals: true,  // Enable global injection for React
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  bail: false,  // Don't stop on first failure
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__mocks__/**'
  ],
  cache: true,  // Enable caching for faster runs
  reporters: ['default']
};
