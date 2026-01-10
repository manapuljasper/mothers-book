/**
 * Booklets API
 *
 * Mock API endpoints for booklet operations.
 * Replace implementations with real API calls when backend is ready.
 */

import { mockRequest, mockMutation } from './client';
import { StorageService, StorageKey } from '../services/storage.service';
import { generateBookletId, generateAccessId } from '../utils/id.utils';
import type {
  MotherBooklet,
  BookletAccess,
  BookletWithMother,
  DoctorProfile,
  MotherProfile,
  MedicalEntry,
} from '../types';

// GET /booklets/:id
export async function getBookletById(id: string): Promise<MotherBooklet | null> {
  return mockRequest(() => {
    const booklets = StorageService.get<MotherBooklet[]>(StorageKey.BOOKLETS) || [];
    return booklets.find((b) => b.id === id) || null;
  });
}

// GET /booklets?motherId=:motherId
export async function getBookletsByMother(motherId: string): Promise<MotherBooklet[]> {
  return mockRequest(() => {
    const booklets = StorageService.get<MotherBooklet[]>(StorageKey.BOOKLETS) || [];
    return booklets.filter((b) => b.motherId === motherId);
  });
}

// GET /booklets/doctor/:doctorId
export async function getBookletsByDoctor(doctorId: string): Promise<BookletWithMother[]> {
  return mockRequest(() => {
    const booklets = StorageService.get<MotherBooklet[]>(StorageKey.BOOKLETS) || [];
    const accessRecords = StorageService.get<BookletAccess[]>(StorageKey.BOOKLET_ACCESS) || [];
    const mothers = StorageService.get<MotherProfile[]>(StorageKey.MOTHER_PROFILES) || [];
    const medicalEntries = StorageService.get<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES) || [];

    // Get booklet IDs with active access
    const accessibleBookletIds = accessRecords
      .filter((a) => a.doctorId === doctorId && !a.revokedAt)
      .map((a) => a.bookletId);

    return booklets
      .filter((b) => accessibleBookletIds.includes(b.id))
      .map((b) => {
        const mother = mothers.find((m) => m.id === b.motherId);
        const bookletEntries = medicalEntries
          .filter((e) => e.bookletId === b.id)
          .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

        return {
          ...b,
          motherName: mother?.fullName || 'Unknown',
          lastVisitDate: bookletEntries[0]?.visitDate,
          nextAppointment: bookletEntries[0]?.followUpDate,
        } as BookletWithMother;
      });
  });
}

// POST /booklets
export async function createBooklet(
  bookletData: Omit<MotherBooklet, 'id' | 'createdAt'>
): Promise<MotherBooklet> {
  return mockMutation(
    (data) => {
      const booklets = StorageService.get<MotherBooklet[]>(StorageKey.BOOKLETS) || [];

      const newBooklet: MotherBooklet = {
        ...data,
        id: generateBookletId(),
        createdAt: new Date(),
      };

      StorageService.set(StorageKey.BOOKLETS, [...booklets, newBooklet]);
      return newBooklet;
    },
    bookletData
  );
}

// PUT /booklets/:id
export async function updateBooklet(
  id: string,
  updates: Partial<MotherBooklet>
): Promise<MotherBooklet> {
  return mockMutation(
    ({ id, updates }) => {
      const booklets = StorageService.get<MotherBooklet[]>(StorageKey.BOOKLETS) || [];
      const updatedBooklets = booklets.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      );
      StorageService.set(StorageKey.BOOKLETS, updatedBooklets);

      const updated = updatedBooklets.find((b) => b.id === id);
      if (!updated) throw new Error('Booklet not found');
      return updated;
    },
    { id, updates }
  );
}

// POST /booklets/:bookletId/access
export async function grantDoctorAccess(
  bookletId: string,
  doctorId: string
): Promise<BookletAccess> {
  return mockMutation(
    ({ bookletId, doctorId }) => {
      const accessRecords = StorageService.get<BookletAccess[]>(StorageKey.BOOKLET_ACCESS) || [];

      // Check if access already exists
      const existing = accessRecords.find(
        (a) => a.bookletId === bookletId && a.doctorId === doctorId && !a.revokedAt
      );
      if (existing) return existing;

      const newAccess: BookletAccess = {
        id: generateAccessId(),
        bookletId,
        doctorId,
        grantedAt: new Date(),
        revokedAt: null,
      };

      StorageService.set(StorageKey.BOOKLET_ACCESS, [...accessRecords, newAccess]);
      return newAccess;
    },
    { bookletId, doctorId }
  );
}

// DELETE /booklets/:bookletId/access/:doctorId
export async function revokeDoctorAccess(
  bookletId: string,
  doctorId: string
): Promise<void> {
  return mockMutation(
    ({ bookletId, doctorId }) => {
      const accessRecords = StorageService.get<BookletAccess[]>(StorageKey.BOOKLET_ACCESS) || [];
      const updatedRecords = accessRecords.map((a) =>
        a.bookletId === bookletId && a.doctorId === doctorId && !a.revokedAt
          ? { ...a, revokedAt: new Date() }
          : a
      );
      StorageService.set(StorageKey.BOOKLET_ACCESS, updatedRecords);
    },
    { bookletId, doctorId }
  );
}

// GET /booklets/:bookletId/doctors
export async function getBookletDoctors(bookletId: string): Promise<DoctorProfile[]> {
  return mockRequest(() => {
    const accessRecords = StorageService.get<BookletAccess[]>(StorageKey.BOOKLET_ACCESS) || [];
    const doctors = StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES) || [];

    const accessibleDoctorIds = accessRecords
      .filter((a) => a.bookletId === bookletId && !a.revokedAt)
      .map((a) => a.doctorId);

    return doctors.filter((d) => accessibleDoctorIds.includes(d.id));
  });
}
