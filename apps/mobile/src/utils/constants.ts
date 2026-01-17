// App constants
export const APP_NAME = "Mother's Book";
export const APP_VERSION = '1.0.0';

// QR Code settings
export const QR_EXPIRY_MINUTES = 10;
export const QR_SIZE = 250;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NOTES_LENGTH = 2000;

// Philippine-specific constants
export const PRC_NUMBER_PATTERN = /^PRC-\d{7}$/;
export const PH_PHONE_PATTERN = /^\+63\s?\d{3}\s?\d{3}\s?\d{4}$/;

// Medical constants
export const BLOOD_PRESSURE_PATTERN = /^\d{2,3}\/\d{2,3}$/;

export const COMMON_LAB_TESTS = [
  'Complete Blood Count (CBC)',
  'Urinalysis',
  'Blood Typing (ABO-Rh)',
  'Hepatitis B Surface Antigen (HBsAg)',
  'HIV Screening',
  'Syphilis (VDRL/RPR)',
  'Glucose Challenge Test (GCT)',
  'Oral Glucose Tolerance Test (OGTT)',
  'Rubella IgG',
  'Thyroid Function Tests (TSH, FT4)',
  'Lipid Profile',
  'Creatinine',
  'Pap Smear',
] as const;

export const COMMON_PRENATAL_MEDICATIONS = [
  { name: 'Ferrous Sulfate', dosage: '325mg', frequency: 1 as const },
  { name: 'Folic Acid', dosage: '400mcg', frequency: 1 as const },
  { name: 'Calcium Carbonate', dosage: '500mg', frequency: 2 as const },
  { name: 'Vitamin D3', dosage: '1000IU', frequency: 1 as const },
  { name: 'Prenatal Vitamins', dosage: '1 tablet', frequency: 1 as const },
] as const;

// Colors for status badges
export const STATUS_COLORS = {
  active: '#22c55e', // green-500
  completed: '#3b82f6', // blue-500
  archived: '#6b7280', // gray-500
  pending: '#f59e0b', // amber-500
  cancelled: '#ef4444', // red-500
  taken: '#22c55e', // green-500
  missed: '#ef4444', // red-500
  skipped: '#6b7280', // gray-500
} as const;
