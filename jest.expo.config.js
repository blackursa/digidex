const { withEnzyme } = require('jest-expo-enzyme');

module.exports = {
  ...withEnzyme,
  projects: [
    {
      preset: 'jest-expo/ios',
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      collectCoverageFrom: [
        '**/*.{js,jsx,ts,tsx}',
        '!**/coverage/**',
        '!**/node_modules/**',
        '!**/babel.config.js',
        '!**/jest.setup.js'
      ]
    }
  ]
};
