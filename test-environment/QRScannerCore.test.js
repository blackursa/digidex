const assert = require('assert');
const QRScannerCore = require('./QRScannerCore');

// Run tests
console.log('Running QRScannerCore tests...\n');

try {
  // Test 1: Scanner initialization
  const scanner = new QRScannerCore();
  const initialState = scanner.getState();
  assert.deepStrictEqual(
    initialState,
    { hasPermission: null, scanned: false },
    'Scanner should initialize with correct state'
  );
  console.log('✓ Test 1 passed: Scanner initializes correctly');

  // Test 2: Permission request
  (async () => {
    const permissionResult = await scanner.requestPermissions();
    assert.deepStrictEqual(
      permissionResult,
      { status: 'granted', granted: true },
      'Permission request should succeed'
    );
    
    const stateAfterPermission = scanner.getState();
    assert.strictEqual(
      stateAfterPermission.hasPermission,
      true,
      'hasPermission should be true after grant'
    );
    console.log('✓ Test 2 passed: Permission handling works');

    // Test 3: Scan handling
    let scanData = null;
    scanner.onScanComplete = (data) => {
      scanData = data;
    };

    scanner.handleScan('test-qr-data');
    assert.deepStrictEqual(
      scanData,
      { type: 'qr', data: 'test-qr-data' },
      'Scan handler should receive correct data'
    );
    assert.strictEqual(
      scanner.getState().scanned,
      true,
      'Scanner should mark as scanned after scan'
    );
    console.log('✓ Test 3 passed: Scan handling works');

    // Test 4: Reset functionality
    scanner.reset();
    assert.strictEqual(
      scanner.getState().scanned,
      false,
      'Scanner should reset scanned state'
    );
    console.log('✓ Test 4 passed: Reset functionality works');

    console.log('\nAll tests passed! ✨');
  })().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
