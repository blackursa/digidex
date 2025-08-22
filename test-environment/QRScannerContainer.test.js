const assert = require('assert');

// Create QR Scanner Container
function createQRScannerContainer(React, ReactNative, ExpoCamera, testScanner = null) {
  // Create QR Scanner component
  const QRScanner = function QRScanner({ permissionStatus, ...props }) {
    if (permissionStatus === 'loading') {
      return React.createElement('div', { className: 'loading' }, 'Loading...');
    }

    if (permissionStatus === 'denied') {
      return React.createElement('div', { className: 'error' }, 'Camera permission denied');
    }

    return React.createElement('div', { className: 'camera' }, 'Camera active');
  };

  return function QRScannerContainer(props) {
    // Initialize scanner instance
    const scanner = React.useMemo(() => {
      return testScanner || { requestPermissions: () => Promise.resolve({ granted: true }) };
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

// Mock scanner class
class MockQRScannerCore {
  constructor(options = {}) {
    this.permissionResult = options.permissionResult || { granted: false };
    console.log('MockQRScannerCore: Created with initial permission:', this.permissionResult);
  }

  setPermissionResult(result) {
    this.permissionResult = result;
    console.log('MockQRScannerCore: Permission set to:', this.permissionResult);
  }

  async requestPermissions() {
    console.log('MockQRScannerCore: Requesting permissions, current state:', this.permissionResult);
    return Promise.resolve(this.permissionResult);
  }

  handleScan() {
    // Mock scan handling
  }

  reset() {
    // Mock reset
  }
}

// Test environment state
class TestEnvironment {
  constructor() {
    this.reset();
  }

  reset(options = {}) {
    this.effectCallback = null;
    this.currentState = {};
    this.stateIndex = 0;
    this.stateUpdateCallbacks = [];
    this.mockScanner = new MockQRScannerCore(options);
  }

  setState(index, value) {
    const newValue = typeof value === 'function' ? value(this.currentState[index]) : value;
    this.currentState[index] = newValue;
    this.stateUpdateCallbacks.forEach(cb => cb(index, newValue));
  }

  waitForStateUpdate(index, expectedValue, timeout = 1000) {
    return new Promise((resolve, reject) => {
      if (this.currentState[index] === expectedValue) {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error(`State update timeout: expected ${expectedValue}, got ${this.currentState[index]}`));
      }, timeout);

      const callback = (updatedIndex, newValue) => {
        if (updatedIndex === index && newValue === expectedValue) {
          clearTimeout(timeoutId);
          resolve();
        }
      };

      this.stateUpdateCallbacks.push(callback);
    });
  }
}

// Create test environment
const env = new TestEnvironment();

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
  useState: (initial) => {
    const index = env.stateIndex++;
    if (env.currentState[index] === undefined) {
      env.currentState[index] = initial;
    }
    return [env.currentState[index], (value) => env.setState(index, value)];
  },
  useEffect: (effect) => {
    env.effectCallback = effect;
  },
  useCallback: (fn) => fn
};

// Wait for state updates
const waitForStateUpdate = (index, expectedValue, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    if (currentState[index] === expectedValue) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error(`State update timeout: expected ${expectedValue}, got ${currentState[index]}}`));
    }, timeout);

    const callback = (updatedIndex, newValue) => {
      if (updatedIndex === index && newValue === expectedValue) {
        clearTimeout(timeoutId);
        resolve();
      }
    };

    stateUpdateCallbacks.push(callback);
  });
};

// Create fresh mock scanner
function createMockScanner(options = {}) {
  const scanner = new MockQRScannerCore();
  if (options.permissionResult) {
    scanner.setPermissionResult(options.permissionResult);
  }
  return scanner;
}

// Mock React Native
const ReactNative = {
  View: 'View'
};

// Mock Expo Camera
const ExpoCamera = {
  Camera: 'Camera'
};

// Reset test environment
function resetTestEnvironment(options = {}) {
  env.reset(options);
  env.mockScanner = createMockScanner(options);
  delete require.cache[require.resolve('./QRScannerContainer')];
}

async function runTests() {
  try {
    console.log('Running QRScannerContainer tests...\n');
    console.log('Test environment initialized');

  // Helper to create fresh container instance
  const createFreshContainer = () => {
    return createQRScannerContainer(React, ReactNative, ExpoCamera, env.mockScanner);
  };

  // Test 1: Component creation
  console.log('\nStarting Test 1: Component creation');
  resetTestEnvironment();
  const container1 = createFreshContainer();
  assert(typeof container1 === 'function', 'Should create wrapper function');
  console.log('✓ Test 1 passed: Component created successfully');

  // Test 2: Default state (loading)
  console.log('\nStarting Test 2: Default state');
  const defaultResult = container1({});
  assert(defaultResult && typeof defaultResult === 'object', 'Should return render result');
  assert.strictEqual(defaultResult.props.permissionStatus, 'loading', 'Should start in loading state');
  console.log('✓ Test 2 passed: Default loading state works');

  // Test 3: Permission granted state
  console.log('\nStarting Test 3: Permission granted state');
  resetTestEnvironment({ permissionResult: { granted: true } });
  const container2 = createFreshContainer();
  const grantedContainer = container2({});
  console.log('Running granted state effect...');
  if (!env.effectCallback) {
    throw new Error('Effect callback not set for granted state test');
  }
  await env.effectCallback();
  console.log('Waiting for granted state update...');
  await env.waitForStateUpdate(0, 'granted');
  assert.strictEqual(env.currentState[0], 'granted', 'Should update state to granted');
  console.log('✓ Test 3 passed: Permission granted state works');

  // Test 4: Permission denied state
  console.log('\nStarting Test 4: Permission denied state');
  resetTestEnvironment({ permissionResult: { granted: false } });
  const container3 = createFreshContainer();
  const deniedContainer = container3({});
  console.log('Running denied state effect...');
  if (!env.effectCallback) {
    throw new Error('Effect callback not set for denied state test');
  }
  await env.effectCallback();
  console.log('Waiting for denied state update...');
  await env.waitForStateUpdate(0, 'denied');
  assert.strictEqual(env.currentState[0], 'denied', 'Should update state to denied');
  console.log('✓ Test 4 passed: Permission denied state works');

  // Test 5: Props forwarding
  resetTestEnvironment();
  const style = { width: 100, height: 100 };
  const onScan = () => {};
  const propsResult = QRScannerContainer({ style, onScan });
  assert.strictEqual(propsResult.props.style, style, 'Should forward style prop');
  assert.strictEqual(propsResult.props.onScan, onScan, 'Should forward onScan prop');
  console.log('✓ Test 5 passed: Props forwarding works');

    console.log('\nAll tests passed! ✨');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error stack:', error.stack);
    console.error('Current environment state:', {
      currentState: env.currentState,
      stateIndex: env.stateIndex,
      effectCallbackExists: !!env.effectCallback
    });
    process.exit(1);
  }
}

runTests();
