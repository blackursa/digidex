export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
}

export interface QRCodeData {
  type: 'profile';
  id: string;
  timestamp: number;
}

export interface ContactRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface QRScanResult {
  type: string;
  data: string;
}
