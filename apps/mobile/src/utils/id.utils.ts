// Simple ID generation without uuid dependency
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = generateRandomString(8);
  return `${timestamp}-${random}`;
}

export function generatePrefixedId(prefix: string): string {
  return `${prefix}-${generateRandomString(8)}`;
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
