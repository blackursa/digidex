// Simple wrapper around QRScannerCore that provides React/React Native interface
const QRScannerCore = require('./QRScannerCore');

function createQRScannerWrapper(React, ReactNative, ExpoCamera) {
  const { View } = ReactNative;
  const { Camera } = ExpoCamera;

  function QRScannerWrapper(props) {
    // Initialize scanner instance
    const scanner = React.useMemo(() => new QRScannerCore(), []);
    
    // Handle barcode scan
    const handleBarCodeScanned = React.useCallback(({ data }) => {
      scanner.handleScan(data);
      if (props.onScan) {
        props.onScan({ type: 'qr', data });
      }
    }, [props.onScan]);

    // Render loading state
    if (props.permissionStatus === 'loading') {
      return React.createElement(View, {
        testID: 'loading-view'
      });
    }

    // Render no permission state
    if (props.permissionStatus === 'denied') {
      return React.createElement(View, {
        testID: 'no-permission-view'
      });
    }

    // Render camera view
    if (props.permissionStatus === 'granted') {
      return React.createElement(Camera, {
        testID: 'camera-view',
        style: props.style || { flex: 1 },
        onBarCodeScanned: handleBarCodeScanned
      });
    }

    // Default to loading view
    return React.createElement(View, {
      testID: 'loading-view'
    });
  }

  return QRScannerWrapper;
}

module.exports = createQRScannerWrapper;
