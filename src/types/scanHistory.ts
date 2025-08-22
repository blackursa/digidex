import { QRCodeData } from './qrcode';

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  data: QRCodeData;
}

export interface ScanHistoryState {
  items: ScanHistoryItem[];
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
}
