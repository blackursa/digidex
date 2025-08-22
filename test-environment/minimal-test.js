const assert = require('assert');

// Mock React hooks
let currentState = 'loading';
const setState = (newState) => {
  currentState = newState;
  console.log('State updated to:', currentState);
};

// Mock scanner
class Scanner {
  constructor(granted = false) {
    this.granted = granted;
    console.log('Scanner created with granted:', granted);
  }

  async requestPermissions() {
    console.log('Requesting permissions, granted:', this.granted);
    return { granted: this.granted };
  }
}

// Test function
async function runTest() {
  try {
    console.log('\nTesting permission denied state:');
    const scanner = new Scanner(false);
    
    // Simulate useEffect
    const result = await scanner.requestPermissions();
    setState(result.granted ? 'granted' : 'denied');
    
    // Verify state
    assert.strictEqual(currentState, 'denied', 'Should be in denied state');
    console.log('✓ Test passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();
