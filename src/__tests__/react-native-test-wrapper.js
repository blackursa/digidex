const assert = require('assert').strict;
const React = require('react');
const { render, fireEvent, waitFor } = require('@testing-library/react-native');

// Test state
const tests = [];
let beforeAllFns = [];
let afterAllFns = [];
let beforeEachFns = [];
let afterEachFns = [];

// Mock utilities
global.jest = {
  fn: () => {
    const mockFn = (...args) => {
      mockFn.calls.push(args);
      return mockFn.implementation ? mockFn.implementation(...args) : undefined;
    };
    mockFn.calls = [];
    mockFn.mockImplementation = (fn) => {
      mockFn.implementation = fn;
      return mockFn;
    };
    mockFn.mockResolvedValue = (value) => {
      return mockFn.mockImplementation(() => Promise.resolve(value));
    };
    mockFn.mockReturnValue = (value) => {
      return mockFn.mockImplementation(() => value);
    };
    mockFn.mockReset = () => {
      mockFn.calls = [];
      mockFn.implementation = null;
    };
    return mockFn;
  },
  clearAllMocks: () => {
    // Implementation would clear all registered mocks
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
  toHaveBeenCalledWith: (...args) => {
    const calls = actual.calls || [];
    assert.ok(
      calls.some(call => 
        JSON.stringify(call) === JSON.stringify(args)
      ),
      `Expected mock to have been called with ${JSON.stringify(args)}`
    );
  }
});

// Helper function to flush promises
async function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
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

// Export utilities
module.exports = {
  runTests,
  render,
  fireEvent,
  waitFor,
  flushPromises
};
