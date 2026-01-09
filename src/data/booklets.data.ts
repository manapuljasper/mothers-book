import type { MotherBooklet, BookletAccess } from '../types';

export const sampleBooklets: MotherBooklet[] = [
  // Maria Isabel Cruz - 2 booklets
  {
    id: 'book-001',
    motherId: 'mom-001',
    label: 'Pregnancy 2024 - Baby Sofia',
    status: 'active',
    createdAt: new Date('2024-03-01T08:00:00Z'),
    expectedDueDate: new Date('2024-11-15'),
    notes: 'First pregnancy, high-risk due to gestational diabetes history in family',
  },
  {
    id: 'book-002',
    motherId: 'mom-001',
    label: 'Pregnancy 2022 - Juan Miguel',
    status: 'completed',
    createdAt: new Date('2022-01-10T08:00:00Z'),
    actualDeliveryDate: new Date('2022-09-05'),
    notes: 'Normal vaginal delivery, 3.2kg baby boy',
  },
  // Anna Patricia Garcia - 1 booklet
  {
    id: 'book-003',
    motherId: 'mom-002',
    label: 'Pregnancy 2024',
    status: 'active',
    createdAt: new Date('2024-04-20T08:00:00Z'),
    expectedDueDate: new Date('2024-12-20'),
    notes: 'Second pregnancy, first child born via C-section',
  },
  // Sofia Beatriz Mendoza - 1 booklet
  {
    id: 'book-004',
    motherId: 'mom-003',
    label: 'Pregnancy 2024 - First Baby',
    status: 'active',
    createdAt: new Date('2024-05-01T08:00:00Z'),
    expectedDueDate: new Date('2025-01-10'),
    notes: 'First pregnancy, primigravida',
  },
];

export const sampleBookletAccess: BookletAccess[] = [
  // Book 001 - Maria's active pregnancy
  {
    id: 'access-001',
    bookletId: 'book-001',
    doctorId: 'doc-001',
    grantedAt: new Date('2024-03-02T10:00:00Z'),
    revokedAt: null,
  },
  {
    id: 'access-002',
    bookletId: 'book-001',
    doctorId: 'doc-002',
    grantedAt: new Date('2024-05-15T14:00:00Z'),
    revokedAt: null,
  },
  // Book 002 - Maria's completed pregnancy
  {
    id: 'access-003',
    bookletId: 'book-002',
    doctorId: 'doc-001',
    grantedAt: new Date('2022-01-15T09:00:00Z'),
    revokedAt: null,
  },
  // Book 003 - Anna's pregnancy
  {
    id: 'access-004',
    bookletId: 'book-003',
    doctorId: 'doc-001',
    grantedAt: new Date('2024-04-21T11:00:00Z'),
    revokedAt: null,
  },
  {
    id: 'access-005',
    bookletId: 'book-003',
    doctorId: 'doc-003',
    grantedAt: new Date('2024-06-01T15:00:00Z'),
    revokedAt: null,
  },
  // Book 004 - Sofia's pregnancy
  {
    id: 'access-006',
    bookletId: 'book-004',
    doctorId: 'doc-003',
    grantedAt: new Date('2024-05-02T09:30:00Z'),
    revokedAt: null,
  },
];
