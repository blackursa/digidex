const QRScannerCore = require('./QRScannerCore');

module.exports = function createQRScannerContainer(React, ReactNative, ExpoCamera, testScanner = null) {
  // Create QR Scanner component
  const QRScanner = require('./QRScanner')(React, ReactNative, ExpoCamera);

  return function QRScannerContainer(props) {
    // Initialize scanner instance
    const scanner = React.useMemo(() => {
      return testScanner || new QRScannerCore();
    }, [testScanner]);
    
    // Track permission state
    const [permissionStatus, setPermissionStatus] = React.useState('loading');

    // Request permissions on mount
    React.useEffect(() => {
      const checkPermissions = async () => {
        try {
          const result = await scanner.requestPermissions();
          const newStatus = result.granted ? 'granted' : 'denied';
          setPermissionStatus(newStatus);
        } catch (error) {
          setPermissionStatus('denied');
        }
      };
      checkPermissions();
    }, [scanner]);

    // Render QR scanner with current permission status
    return React.createElement(QRScanner, {
      ...props,
      permissionStatus
    });
  };
}

module.exports = createQRScannerContainer;
