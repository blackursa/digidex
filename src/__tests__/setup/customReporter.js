class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    console.log('\nTest Results:');
    console.log('Total Tests:', results.numTotalTests);
    console.log('Passed Tests:', results.numPassedTests);
    console.log('Failed Tests:', results.numFailedTests);
    console.log('Test Suites:', results.numTotalTestSuites);
    
    if (results.testResults) {
      results.testResults.forEach(testSuite => {
        console.log('\nTest Suite:', testSuite.testFilePath);
        testSuite.testResults.forEach(test => {
          console.log(`  ${test.status}: ${test.title}`);
        });
      });
    }
  }

  onRunStart() {
    console.log('\nStarting test run...');
  }

  onTestResult(test, testResult) {
    console.log(`\nFinished test file: ${test.path}`);
    console.log('Status:', testResult.numFailingTests ? 'Failed' : 'Passed');
  }
}

module.exports = CustomReporter;
