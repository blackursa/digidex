import { generateQRCode, parseQRCode, type QRCodeData } from '../qrcode';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

describe('QR Code Service', () => {
  const validProfileData: QRCodeData = {
    type: 'profile' as const,
    id: 'test-user-id',
  };

  describe('generateQRCode', () => {
    it('generates valid QR code data for profile', () => {
      const qrData = generateQRCode(validProfileData);
      expect(typeof qrData).toBe('string');
      expect(qrData.length).toBeGreaterThan(0);
    });

    it('throws error for invalid data', () => {
      expect(() => generateQRCode(null as any)).toThrow();
      expect(() => generateQRCode({} as any)).toThrow();
      expect(() => generateQRCode({ type: 'invalid' } as any)).toThrow();
    });

    it('generates different codes for different IDs', () => {
      const code1 = generateQRCode({ ...validProfileData, id: 'user1' } as QRCodeData);
      const code2 = generateQRCode({ ...validProfileData, id: 'user2' } as QRCodeData);
      expect(code1).not.toBe(code2);
    });
  });

  describe('parseQRCode', () => {
    it('parses valid QR code data', () => {
      const qrData = generateQRCode(validProfileData);
      const parsed = parseQRCode(qrData);
      expect(parsed).toEqual(validProfileData);
    });

    it('handles expired QR codes', () => {
      const expiredData: QRCodeData = {
        ...validProfileData,
        expiresAt: new Date(Date.now() - 1000)
      };
      const qrData = generateQRCode(expiredData);
      expect(() => parseQRCode(qrData)).toThrow(/expired/);
    });

    it('accepts valid unexpired QR codes', () => {
      const validExpiry: QRCodeData = {
        ...validProfileData,
        expiresAt: new Date(Date.now() + 3600000)
      };
      const qrData = generateQRCode(validExpiry);
      const parsed = parseQRCode(qrData);
      expect(parsed).toEqual(validExpiry);
    });

    it('returns null for invalid QR code data', () => {
      expect(parseQRCode('invalid-data')).toBeNull();
      expect(parseQRCode('')).toBeNull();
    });

    it('handles malformed but structured data', () => {
      const malformedData = Buffer.from(JSON.stringify({ type: 'wrong' })).toString('base64');
      expect(parseQRCode(malformedData)).toBeNull();
    });

    it('maintains data integrity through generate-parse cycle', () => {
      const testCases = [
        { type: 'profile', id: 'test-1' },
        { type: 'profile', id: 'test-2' },
        { type: 'profile', id: 'test-3' },
      ];

      testCases.forEach(testCase => {
        const generated = generateQRCode(testCase);
        const parsed = parseQRCode(generated);
        expect(parsed).toEqual(testCase);
      });
    });
  });
});
