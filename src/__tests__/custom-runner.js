const fs = require('fs');
const path = require('path');
const ReactTestRenderer = require('react-test-renderer');

// Basic test utilities
const expect = {
    toBe(actual, expected) {
        if (actual !== expected) {
            throw new Error(`Expected ${expected} but got ${actual}`);
        }
        return true;
    },
    toMatchSnapshot(actual, snapshotName) {
        const snapshotDir = path.join(__dirname, '__snapshots__');
        if (!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir);
        }

        const snapshotFile = path.join(snapshotDir, `${snapshotName}.snap`);
        const serialized = JSON.stringify(actual, null, 2);

        if (!fs.existsSync(snapshotFile)) {
            fs.writeFileSync(snapshotFile, serialized);
            console.log(`Created snapshot: ${snapshotName}`);
            return true;
        }

        const existing = fs.readFileSync(snapshotFile, 'utf8');
        if (existing === serialized) {
            console.log(`✓ Snapshot matches: ${snapshotName}`);
            return true;
        } else {
            console.error(`✗ Snapshot mismatch: ${snapshotName}`);
            console.error('Expected:', existing);
            console.error('Received:', serialized);
            throw new Error('Snapshot mismatch');
        }
    }
};

global.test = (name, fn) => {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(error);
    }
};

// Export test utilities
module.exports = {
    expect,
    test,
    ReactTestRenderer
};
