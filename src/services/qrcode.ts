// Using Buffer for base64 encoding/decoding

export interface QRCodeData {
  type: 'profile' | 'contact';
  id: string;
  name?: string;
  email?: string;
  expiresAt?: Date;
}

export const generateQRCode = (data: QRCodeData): string => {
  try {
    // Validate required fields
    if (!data.type || !data.id) {
      throw new Error('Missing required fields: type and id');
    }

    // Validate type
    if (!['profile', 'contact'].includes(data.type)) {
      throw new Error('Invalid QR code type');
    }

    // Create a URL-safe data string
    const payload = Buffer.from(JSON.stringify(data)).toString('base64');
    return `https://digidex.app/connect/${payload}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const parseQRCode = (qrData: string): QRCodeData | null => {
  try {
    // Extract payload from URL
    const payload = qrData.split('/connect/')[1];
    if (!payload) return null;
    
    // Decode and parse the data
    const decodedData = Buffer.from(payload, 'base64').toString('utf-8');
    const data = JSON.parse(decodedData) as QRCodeData;
    
    // Validate the data structure
    if (!data.type || !data.id) return null;

    // Check expiration if present
    if (data.expiresAt) {
      const expiryDate = new Date(data.expiresAt);
      if (isNaN(expiryDate.getTime())) return null;
      if (expiryDate < new Date()) {
        const error = new Error('QR code has expired') as Error & { code?: string };
        error.code = 'expired_qr';
        throw error;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
};
