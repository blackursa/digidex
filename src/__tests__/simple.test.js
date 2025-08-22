console.log('Starting test...');

// Basic test function
function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
      return true;
    }
  };
}

// Run test
try {
  console.log('Running test case...');
  const result = expect(true).toBe(true);
  console.log('Test passed!');
  process.exit(0);
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
