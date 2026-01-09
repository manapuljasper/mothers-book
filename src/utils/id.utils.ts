import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function generatePrefixedId(prefix: string): string {
  return `${prefix}-${uuidv4().slice(0, 8)}`;
}

// Generate IDs for specific entity types
export const generateUserId = () => generatePrefixedId('user');
export const generateDoctorId = () => generatePrefixedId('doc');
export const generateMotherId = () => generatePrefixedId('mom');
export const generateBookletId = () => generatePrefixedId('book');
export const generateAccessId = () => generatePrefixedId('access');
export const generateEntryId = () => generatePrefixedId('entry');
export const generateLabId = () => generatePrefixedId('lab');
export const generateMedicationId = () => generatePrefixedId('med');
export const generateIntakeLogId = () => generatePrefixedId('intake');
export const generateQRTokenId = () => generatePrefixedId('qr');
