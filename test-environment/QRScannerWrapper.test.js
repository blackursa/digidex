const assert = require('assert');
const createQRScannerWrapper = require('./QRScannerWrapper');

// Simple React test environment
const React = {
  createElement: (type, props) => {
    const cleanProps = Object.entries(props || {}).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    return { type, props: cleanProps };
  },
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn
};

// Reset React state between tests
function resetReactState() {
  currentState = {};
  stateIndex = 0;
}

// Mock React Native
const ReactNative = {
  View: 'View'
};

// Mock Expo Camera
const ExpoCamera = {
  Camera: 'Camera'
};

// Run tests
console.log('Running QRScannerWrapper tests...\n');

try {
  // Test 1: Component creation
  const QRScannerWrapper = createQRScannerWrapper(React, ReactNative, ExpoCamera);
  assert(typeof QRScannerWrapper === 'function', 'Should create wrapper function');
  console.log('✓ Test 1 passed: Component created successfully');

  // Test 2: Default state (loading)
  const defaultResult = QRScannerWrapper({});
  assert(defaultResult && typeof defaultResult === 'object', 'Should return render result');
  assert.strictEqual(defaultResult.type, 'View', 'Should render View by default');
  assert.strictEqual(defaultResult.props.testID, 'loading-view', 'Should have loading-view testID');
  console.log('✓ Test 2 passed: Default loading state works');

  // Test 3: Loading state
  const loadingResult = QRScannerWrapper({ permissionStatus: 'loading' });
  assert.strictEqual(loadingResult.type, 'View', 'Should render View when loading');
  assert.strictEqual(loadingResult.props.testID, 'loading-view', 'Should have loading-view testID');
  console.log('✓ Test 3 passed: Loading state works');

  // Test 4: Permission denied state
  const deniedResult = QRScannerWrapper({ permissionStatus: 'denied' });
  assert.strictEqual(deniedResult.type, 'View', 'Should render View when permission denied');
  assert.strictEqual(deniedResult.props.testID, 'no-permission-view', 'Should have no-permission-view testID');
  console.log('✓ Test 4 passed: Permission denied state works');

  // Test 5: Permission granted state
  const style = { width: 100, height: 100 };
  const grantedResult = QRScannerWrapper({ 
    permissionStatus: 'granted',
    style
  });
  assert.strictEqual(grantedResult.type, 'Camera', 'Should render Camera when permission granted');
  assert.strictEqual(grantedResult.props.testID, 'camera-view', 'Should have camera-view testID');
  assert.deepStrictEqual(grantedResult.props.style, style, 'Should handle style prop');
  console.log('✓ Test 5 passed: Permission granted state works');

  // Test 6: Scan callback
  let scanData = null;
  const withCallback = QRScannerWrapper({
    permissionStatus: 'granted',
    onScan: (data) => { scanData = data; }
  });
  withCallback.props.onBarCodeScanned({ data: 'test-qr-code' });
  assert.deepStrictEqual(scanData, { type: 'qr', data: 'test-qr-code' }, 'Should handle scan callback');
  console.log('✓ Test 6 passed: Scan callback works');

  console.log('\nAll tests passed! ✨');
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
