import { generateQRCode } from '../../services/qrcode';

export const TestScenarios = {
  Users: {
    validUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
    otherUser: {
      id: 'other-user-id',
      email: 'other@example.com',
      displayName: 'Other User',
    },
    invalidUser: {
      id: 'invalid-user-id',
      email: 'invalid@example.com',
      displayName: 'Invalid User',
    },
  },

  QRCodes: {
    generateValid: () => {
      const data = {
        type: 'profile',
        id: TestScenarios.Users.otherUser.id,
      };
      return {
        data,
        code: generateQRCode(data),
      };
    },
    generateInvalid: () => ({
      data: null,
      code: 'invalid-qr-code',
    }),
    generateSelf: (userId: string) => {
      const data = {
        type: 'profile',
        id: userId,
      };
      return {
        data,
        code: generateQRCode(data),
      };
    },
  },

  Errors: {
    InvalidQRCode: 'Invalid QR code',
    UserNotFound: 'User profile not found',
    SelfScan: 'You cannot scan your own QR code',
    ShareFailed: 'Failed to share QR code',
    RequestFailed: 'Failed to send contact request',
  },

  MockResponses: {
    success: {
      status: 'granted',
      granted: true,
    },
    denied: {
      status: 'denied',
      granted: false,
    },
    error: new Error('Mock error'),
  },

  Delays: {
    animation: 300,
    network: 1000,
    permission: 500,
  },

  async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
