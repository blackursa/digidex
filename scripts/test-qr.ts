import { generateQRCode, parseQRCode, type QRCodeData } from '../src/services/qrcode';

// Test valid QR code
const testValidQR = () => {
  const data: QRCodeData = {
    type: 'profile',
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com'
  };

  const qrCode = generateQRCode(data);
  console.log('Generated QR Code:', qrCode);

  const parsed = parseQRCode(qrCode);
  console.log('Parsed Data:', parsed);
  console.log('Data matches:', JSON.stringify(data) === JSON.stringify(parsed));
};

// Test expired QR code
const testExpiredQR = () => {
  const data: QRCodeData = {
    type: 'profile',
    id: 'expired-user-123',
    expiresAt: new Date(Date.now() - 3600000) // 1 hour ago
  };

  const qrCode = generateQRCode(data);
  console.log('\nExpired QR Code:', qrCode);

  try {
    const parsed = parseQRCode(qrCode);
    console.log('Should not reach here:', parsed);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Expected error:', error.message);
    } else {
      console.log('Unknown error:', error);
    }
  }
};

// Test invalid QR code
const testInvalidQR = () => {
  console.log('\nTesting invalid QR code:');
  const result = parseQRCode('invalid-data');
  console.log('Result (should be null):', result);
};

console.log('Running QR code tests...\n');
testValidQR();
testExpiredQR();
testInvalidQR();
