// Simple test wrapper that supports async/await and basic assertions
const assert = require('assert').strict;

// Global test state
const tests = [];
let beforeAllFns = [];
let afterAllFns = [];
let beforeEachFns = [];
let afterEachFns = [];

// Mock functionality similar to Jest
global.jest = {
  fn: () => {
    const mockFn = (...args) => {
      mockFn.mock.calls.push(args);
      return mockFn.mock.implementation ? mockFn.mock.implementation(...args) : undefined;
    };
    mockFn.mock = {
      calls: [],
      implementation: null,
      results: []
    };
    mockFn.mockImplementation = (fn) => {
      mockFn.mock.implementation = fn;
      return mockFn;
    };
    mockFn.mockResolvedValue = (value) => {
      return mockFn.mockImplementation(() => Promise.resolve(value));
    };
    mockFn.mockReturnValue = (value) => {
      return mockFn.mockImplementation(() => value);
    };
    mockFn.mockReset = () => {
      mockFn.mock.calls = [];
      mockFn.mock.implementation = null;
      mockFn.mock.results = [];
    };
    return mockFn;
  },
  clearAllMocks: () => {
    // Clear all registered mock functions
    const mockFns = [];
    Object.values(global).forEach(value => {
      if (value && value.mock && typeof value.mockReset === 'function') {
        mockFns.push(value);
      }
    });
    mockFns.forEach(mock => mock.mockReset());
  },
  useRealTimers: () => {
    // Implementation would handle timer mocking
  }
};

// Test utilities
global.describe = (name, fn) => {
  console.log(`\n🔍 ${name}`);
  fn();
};

global.it = (name, fn) => {
  tests.push({ name, fn });
};

global.beforeAll = (fn) => {
  beforeAllFns.push(fn);
};

global.afterAll = (fn) => {
  afterAllFns.push(fn);
};

global.beforeEach = (fn) => {
  beforeEachFns.push(fn);
};

global.afterEach = (fn) => {
  afterEachFns.push(fn);
};

global.expect = (actual) => ({
  toBe: (expected) => assert.strictEqual(actual, expected),
  toBeTruthy: () => assert.ok(actual),
  toBeFalsy: () => assert.ok(!actual),
  toEqual: (expected) => assert.deepStrictEqual(actual, expected),
  toHaveBeenCalled: () => {
    const mockFn = actual;
    assert.ok(
      mockFn && mockFn.mock && mockFn.mock.calls.length > 0,
      'Expected mock function to have been called'
    );
  },
  toHaveBeenCalledWith: (...args) => {
    const mockFn = actual;
    assert.ok(
      mockFn && mockFn.mock && mockFn.mock.calls.some(call => 
        JSON.stringify(call) === JSON.stringify(args)
      ),
      `Expected mock to have been called with ${JSON.stringify(args)}`
    );
  }
});

// Helper functions
async function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

function clearMockImplementations(obj, seen = new WeakSet()) {
  if (!obj || typeof obj !== 'object' || seen.has(obj)) return;
  seen.add(obj);
  
  // Only clear mock functions at the top level
  if (obj.mock && typeof obj.mockReset === 'function') {
    obj.mockReset();
    return;
  }

  // Only traverse one level deep to avoid circular references
  Object.values(obj).forEach(value => {
    if (value && typeof value === 'object' && !seen.has(value)) {
      if (value.mock && typeof value.mockReset === 'function') {
        value.mockReset();
      }
    }
  });
}

// Run all tests
async function runTests() {
  let passed = 0;
  let failed = 0;

  try {
    // Run beforeAll
    for (const fn of beforeAllFns) {
      await fn();
    }

    // Run tests
    for (const test of tests) {
      try {
        // Run beforeEach
        for (const fn of beforeEachFns) {
          await fn();
        }
        // Clear mock implementations before each test
        clearMockImplementations(global);

        // Run test
        await test.fn();
        await flushPromises();
        
        // Run afterEach
        for (const fn of afterEachFns) {
          await fn();
        }
        console.log(`✅ ${test.name}`);
        passed++;
      } catch (error) {
        console.error(`❌ ${test.name}`);
        console.error(`   Error: ${error.message}`);
        failed++;
      }
    }

    // Run afterAll
    for (const fn of afterAllFns) {
      await fn();
    }
  } catch (error) {
    console.error('❌ Suite failed:', error.message);
    process.exit(1);
  }

  // Print summary
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

// Export for use in test files
module.exports = { runTests };
