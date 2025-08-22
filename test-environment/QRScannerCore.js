// Core QR Scanner functionality without React/React Native dependencies
class QRScannerCore {
  constructor() {
    this.hasPermission = null;
    this.scanned = false;
    this.onScanComplete = null;
  }

  async requestPermissions() {
    try {
      const result = await this.requestCameraPermission();
      this.hasPermission = result.granted;
      return result;
    } catch (error) {
      this.hasPermission = false;
      throw error;
    }
  }

  async requestCameraPermission() {
    // Simulate camera permission request
    return {
      status: 'granted',
      granted: true
    };
  }

  handleScan(data) {
    if (this.scanned || !this.hasPermission) {
      return;
    }

    this.scanned = true;
    if (this.onScanComplete) {
      this.onScanComplete({
        type: 'qr',
        data
      });
    }
  }

  reset() {
    this.scanned = false;
  }

  getState() {
    return {
      hasPermission: this.hasPermission,
      scanned: this.scanned
    };
  }
}

module.exports = QRScannerCore;
