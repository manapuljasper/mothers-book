export interface QRToken {
  id: string;
  bookletId: string;
  expiresAt: Date;
  usedAt?: Date | null;
  usedByDoctorId?: string;
  createdAt: Date;
}

export interface QRCodeData {
  type: 'booklet_access';
  version: 1;
  tokenId: string;
  bookletId: string;
  motherName: string;
  bookletLabel: string;
  expiresAt: string; // ISO string
}

export const QR_EXPIRY_MINUTES = 10;
