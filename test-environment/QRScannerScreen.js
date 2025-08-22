const React = require('react');
const ReactNative = require('react-native');
const ExpoCamera = require('expo-camera');
const ExpoBarCodeScanner = require('expo-barcode-scanner');

const { View, Alert } = ReactNative;
const { Camera } = ExpoCamera;
const { BarCodeScanner } = ExpoBarCodeScanner;

const QRScannerScreen = (props) => {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert('Scan Complete', `Bar code type: ${type}\nData: ${data}`, [
      { text: 'Scan Again', onPress: () => setScanned(false) }
    ]);
  };

  if (hasPermission === null) {
    return React.createElement(View, { 
      testID: 'loading-view',
      ...props
    });
  }

  if (hasPermission === false) {
    return React.createElement(View, { 
      testID: 'no-permission-view',
      ...props
    });
  }

  return React.createElement(Camera, { 
    testID: 'camera-view',
    onBarCodeScanned: scanned ? undefined : handleBarCodeScanned,
    style: { flex: 1 },
    ...props
  });
};

module.exports = {
  QRScannerScreen
};
