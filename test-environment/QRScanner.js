module.exports = function createQRScanner(React, ReactNative, ExpoCamera) {
  return function QRScanner({ permissionStatus, ...props }) {
    if (permissionStatus === 'loading') {
      return React.createElement('div', { className: 'loading' }, 'Loading...');
    }

    if (permissionStatus === 'denied') {
      return React.createElement('div', { className: 'error' }, 'Camera permission denied');
    }

    return React.createElement('div', { className: 'camera' }, 'Camera active');
  };
};
