const { spawnSync } = require('child_process');
const path = require('path');

console.log('Starting debug test runner...');

// Run Jest with Node's --prof flag to generate CPU profile
const result = spawnSync('node', [
  '--prof',
  path.resolve(__dirname, '../../node_modules/jest/bin/jest.js'),
  'minimal-qr.test.js',
  '--no-cache',
  '--verbose',
  '--runInBand',
  '--testTimeout=5000'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--trace-warnings --trace-exit',
    DEBUG: 'jest:*'
  }
});

if (result.error) {
  console.error('Error running tests:', result.error);
  process.exit(1);
}

console.log('Test run complete');
