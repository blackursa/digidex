const { spawn } = require('child_process');
const path = require('path');

// Get a random port between 9230 and 9330 to avoid conflicts
const debugPort = Math.floor(Math.random() * 100) + 9230;

// Create a child process to run the test using ts-node
const testProcess = spawn('npx', [
  'ts-node',
  '--inspect=' + debugPort,
  path.join(__dirname, 'simple.test.ts')
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    TS_NODE_COMPILER_OPTIONS: '{"module":"commonjs"}'
  }
});

// Set a timeout to kill the process if it hangs
const timeoutMs = 5000;
const timeout = setTimeout(() => {
  console.error(`Test execution timed out after ${timeoutMs}ms`);
  testProcess.kill();
  process.exit(1);
}, timeoutMs);

// Handle process exit
testProcess.on('exit', (code) => {
  clearTimeout(timeout);
  process.exit(code || 0);
});
