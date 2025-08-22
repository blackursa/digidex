class MockQRScannerCore {
  constructor() {
    this.permissionResult = { granted: false };
    console.log('MockQRScannerCore: Created with initial permission:', this.permissionResult);
  }

  setPermissionResult(result) {
    this.permissionResult = result;
    console.log('MockQRScannerCore: Permission set to:', this.permissionResult);
  }

  async requestPermissions() {
    console.log('MockQRScannerCore: Requesting permissions, current state:', this.permissionResult);
    return Promise.resolve(this.permissionResult);
  }

  handleScan() {
    // Mock scan handling
  }

  reset() {
    // Mock reset
  }
}

module.exports = MockQRScannerCore;
