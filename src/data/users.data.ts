import type { User } from '../types';

export const sampleUsers: User[] = [
  // Doctors
  {
    id: 'user-doc-001',
    email: 'dr.santos@clinic.ph',
    role: 'doctor',
    createdAt: new Date('2024-01-15T08:00:00Z'),
  },
  {
    id: 'user-doc-002',
    email: 'dr.reyes@hospital.ph',
    role: 'doctor',
    createdAt: new Date('2024-02-20T08:00:00Z'),
  },
  {
    id: 'user-doc-003',
    email: 'dr.villanueva@medcenter.ph',
    role: 'doctor',
    createdAt: new Date('2024-03-01T08:00:00Z'),
  },
  // Mothers
  {
    id: 'user-mom-001',
    email: 'maria.cruz@gmail.com',
    role: 'mother',
    createdAt: new Date('2024-03-01T08:00:00Z'),
  },
  {
    id: 'user-mom-002',
    email: 'anna.garcia@gmail.com',
    role: 'mother',
    createdAt: new Date('2024-03-15T08:00:00Z'),
  },
  {
    id: 'user-mom-003',
    email: 'sofia.mendoza@gmail.com',
    role: 'mother',
    createdAt: new Date('2024-04-01T08:00:00Z'),
  },
];
