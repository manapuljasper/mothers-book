import type { MotherProfile } from '../types';

export const sampleMotherProfiles: MotherProfile[] = [
  {
    id: 'mom-001',
    userId: 'user-mom-001',
    fullName: 'Maria Isabel Cruz',
    birthdate: new Date('1992-05-15'),
    contactNumber: '+63 920 456 7890',
    address: '789 Mabini Street, Pasig City, Metro Manila',
    emergencyContact: '+63 921 567 8901',
    emergencyContactName: 'Juan Cruz (Husband)',
    babyName: 'Sofia',
  },
  {
    id: 'mom-002',
    userId: 'user-mom-002',
    fullName: 'Anna Patricia Garcia',
    birthdate: new Date('1988-11-22'),
    contactNumber: '+63 922 678 9012',
    address: '321 Bonifacio Avenue, Taguig City, Metro Manila',
    emergencyContact: '+63 923 789 0123',
    emergencyContactName: 'Miguel Garcia (Husband)',
  },
  {
    id: 'mom-003',
    userId: 'user-mom-003',
    fullName: 'Sofia Beatriz Mendoza',
    birthdate: new Date('1995-03-08'),
    contactNumber: '+63 924 890 1234',
    address: '456 Ayala Avenue, Makati City, Metro Manila',
    emergencyContact: '+63 925 901 2345',
    emergencyContactName: 'Carlos Mendoza (Husband)',
  },
];
