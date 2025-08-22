const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on('message', (result) => {
    console.log(result);
    process.exit(result.success ? 0 : 1);
  });
  worker.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  const jest = require('jest');
  jest.run(['src/screens/__tests__/QRScannerScreen.test.js', '--no-cache', '--verbose', '--detectOpenHandles'])
    .then((success) => {
      parentPort.postMessage({ success });
    })
    .catch((error) => {
      parentPort.postMessage({ success: false, error: error.message });
    });
}
