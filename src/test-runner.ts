import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Basic test utilities
class TestSuite {
  private tests: { name: string; fn: () => Promise<void> | void }[] = [];
  private beforeAllFns: (() => Promise<void> | void)[] = [];
  private afterAllFns: (() => Promise<void> | void)[] = [];

  describe(name: string, fn: () => void) {
    console.log(`\n🔍 ${name}`);
    fn();
  }

  it(name: string, fn: () => Promise<void> | void) {
    this.tests.push({ name, fn });
  }

  beforeAll(fn: () => Promise<void> | void) {
    this.beforeAllFns.push(fn);
  }

  afterAll(fn: () => Promise<void> | void) {
    this.afterAllFns.push(fn);
  }

  async runTests() {
    let passed = 0;
    let failed = 0;

    try {
      // Run beforeAll hooks
      for (const beforeFn of this.beforeAllFns) {
        await beforeFn();
      }

      // Run tests
      for (const test of this.tests) {
        try {
          await test.fn();
          console.log(`✅ ${test.name}`);
          passed++;
        } catch (error) {
          console.error(`❌ ${test.name}`);
          console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
          failed++;
        }
      }

      // Run afterAll hooks
      for (const afterFn of this.afterAllFns) {
        await afterFn();
      }
    } catch (error) {
      console.error('❌ Suite failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // Print summary
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Create global test utilities
declare global {
  var describe: (name: string, fn: () => void) => void;
  var it: (name: string, fn: () => Promise<void> | void) => void;
  var beforeAll: (fn: () => Promise<void> | void) => void;
  var afterAll: (fn: () => Promise<void> | void) => void;
  var expect: (actual: any) => {
    toBe: (expected: any) => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toEqual: (expected: any) => void;
  };
}

const suite = new TestSuite();
global.describe = suite.describe.bind(suite);
global.it = suite.it.bind(suite);
global.beforeAll = suite.beforeAll.bind(suite);
global.afterAll = suite.afterAll.bind(suite);

// Basic expect function
global.expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected ${actual} to be truthy`);
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected ${actual} to be falsy`);
    }
  },
  toEqual: (expected: any) => {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
    }
  }
});

// Main function to run tests
async function runTests(testFile: string) {
  console.log(`\n🚀 Running tests in ${testFile}\n`);
  
  try {
    // Import and execute the test file
    await import(testFile);
    
    // Run the test suite
    await suite.runTests();
  } catch (error) {
    console.error('❌ Failed to run tests:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Get the test file from command line arguments
const testFile = process.argv[2];
if (!testFile) {
  console.error('Please provide a test file path');
  process.exit(1);
}

// Run the tests
runTests(path.resolve(testFile));
