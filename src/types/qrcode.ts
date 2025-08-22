export interface QRCodeData {
  type: 'profile' | 'contact';
  id: string;
  version?: string;
  metadata?: {
    timestamp?: number;
    batchId?: string;
  };
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  data: QRCodeData;
  metadata: {
    timestamp: number;
    batchId?: string;
  };
}

export interface QRScanResult {
  type: 'profile' | 'contact';
  id: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

export type QRScanErrorCode = 'invalid_qr' | 'unsupported_type' | 'self_scan' | 'profile_not_found' | 'request_failed' | 'expired_qr' | 'unknown_error';
