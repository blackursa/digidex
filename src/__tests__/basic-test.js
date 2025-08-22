const { runTests } = require('./test-wrapper');

// Write our test cases
describe('Basic Test Suite', () => {
  beforeAll(() => {
    console.log('Setting up test suite...');
  });

  it('should handle basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect({ name: 'test' }).toEqual({ name: 'test' });
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  afterAll(() => {
    console.log('Cleaning up test suite...');
  });
});

// Run the tests
runTests();
