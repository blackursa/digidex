export type QRScanErrorCode = 
  | 'invalid_qr'
  | 'expired_qr'
  | 'unsupported_type'
  | 'self_scan'
  | 'profile_not_found'
  | 'request_failed'
  | 'permission_denied'
  | 'camera_unavailable'
  | 'network_error';

export class QRScanError extends Error {
  code: QRScanErrorCode;
  recoverable: boolean;
  retryCount: number;

  constructor(code: QRScanErrorCode, message?: string) {
    super(message || QRScanError.getDefaultMessage(code));
    this.code = code;
    this.name = 'QRScanError';
    this.recoverable = QRScanError.isRecoverable(code);
    this.retryCount = 0;
  }

  static getDefaultMessage(code: QRScanErrorCode): string {
    switch (code) {
      case 'invalid_qr':
        return 'Invalid QR code. Please try scanning a valid DigiDex QR code.';
      case 'expired_qr':
        return 'This QR code has expired. Please request a new one.';
      case 'unsupported_type':
        return 'Unsupported QR code type. Please scan a DigiDex contact QR code.';
      case 'self_scan':
        return 'You cannot scan your own QR code.';
      case 'profile_not_found':
        return 'User profile not found. They may have deleted their account.';
      case 'request_failed':
        return 'Failed to process contact request. Please try again.';
      case 'permission_denied':
        return 'Camera permission denied. Please enable camera access in settings.';
      case 'camera_unavailable':
        return 'Camera is not available on this device.';
      case 'network_error':
        return 'Network error. Please check your connection and try again.';
    }
  }

  static isRecoverable(code: QRScanErrorCode): boolean {
    return [
      'request_failed',
      'network_error',
      'invalid_qr'
    ].includes(code);
  }

  canRetry(): boolean {
    return this.recoverable && this.retryCount < 3;
  }

  incrementRetry(): void {
    this.retryCount++;
  }

  getAccessibilityMessage(): string {
    let message = this.message;
    if (this.canRetry()) {
      message += ' Tap anywhere to try again.';
    }
    return message;
  }

  async recoverFromError(): Promise<boolean> {
    switch (this.code) {
      case 'permission_denied':
        try {
          const { Camera } = require('expo-camera');
          await Camera.requestCameraPermissionsAsync();
          return true;
        } catch (e) {
          return false;
        }
      case 'network_error':
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      default:
        return false;
    }
  }
}
