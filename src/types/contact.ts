export interface Contact {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  email: string;
  company?: string;
  title?: string;
  photoURL?: string;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
}
