// Set up module mocks
const mockModules = {
    'react': {
        createElement: (type, props) => ({ type, props }),
        default: { createElement: (type, props) => ({ type, props }) }
    },
    'react-native': {
        View: (props) => ({ type: 'View', props })
    }
};

// Mock require function
const originalRequire = require;
require = function(moduleName) {
    if (mockModules[moduleName]) {
        return mockModules[moduleName];
    }
    return originalRequire(moduleName);
};

// Set up test environment
global.describe = (name, fn) => {
    console.log(`\nTest Suite: ${name}`);
    fn();
};

global.it = (name, fn) => {
    console.log(`\nTest: ${name}`);
    try {
        fn();
        console.log('✓ Passed');
    } catch (error) {
        console.error('✗ Failed:', error.message);
        process.exitCode = 1;
    }
};

global.expect = (actual) => ({
    toBeDefined: () => {
        if (actual === undefined) {
            throw new Error('Expected value to be defined');
        }
        return true;
    },
    toBeTruthy: () => {
        if (!actual) {
            throw new Error('Expected value to be truthy');
        }
        return true;
    }
});

// Run the test
try {
    require('./QRScannerScreen.test.js');
    console.log('\nAll tests completed successfully.');
} catch (error) {
    console.error('Error running tests:', error);
    process.exitCode = 1;
}
