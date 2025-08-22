// Mock React Native permissions
const mockPermissions = {
  CAMERA: 'camera',
  status: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined'
  }
};

// Mock Expo Camera
const mockCamera = {
  Camera: {
    requestCameraPermissionsAsync: async () => ({
      status: mockPermissions.status.GRANTED,
      granted: true
    }),
    Constants: {
      Type: {
        back: 'back'
      }
    }
  }
};

// Mock BarCodeScanner
const mockBarCodeScanner = {
  BarCodeScanner: {
    requestPermissionsAsync: async () => ({
      status: mockPermissions.status.GRANTED,
      granted: true
    }),
    Constants: {
      Type: {
        back: 'back'
      }
    }
  }
};

// Mock Alert
const mockAlert = {
  alert: (title, message, buttons) => {
    console.log('Alert shown:', { title, message, buttons });
    // Simulate user pressing the first button
    if (buttons && buttons.length > 0 && buttons[0].onPress) {
      buttons[0].onPress();
    }
  }
};

module.exports = {
  mockPermissions,
  mockCamera,
  mockBarCodeScanner,
  mockAlert
};
