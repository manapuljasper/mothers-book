/**
 * Medical API
 *
 * Mock API endpoints for medical entries and lab requests.
 * Replace implementations with real API calls when backend is ready.
 */

import { mockRequest, mockMutation } from './client';
import { StorageService, StorageKey } from '../services/storage.service';
import { generateEntryId, generateLabId } from '../utils/id.utils';
import type {
  MedicalEntry,
  MedicalEntryWithDoctor,
  LabRequest,
  LabStatus,
  DoctorProfile,
} from '../types';

// GET /entries?bookletId=:bookletId
export async function getEntriesByBooklet(bookletId: string): Promise<MedicalEntryWithDoctor[]> {
  return mockRequest(() => {
    const entries = StorageService.get<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES) || [];
    const doctors = StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES) || [];

    return entries
      .filter((e) => e.bookletId === bookletId)
      .map((e) => {
        const doctor = doctors.find((d) => d.id === e.doctorId);
        return {
          ...e,
          doctorName: doctor?.fullName || 'Unknown Doctor',
          doctorSpecialization: doctor?.specialization,
        } as MedicalEntryWithDoctor;
      })
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  });
}

// GET /entries/:id
export async function getEntryById(id: string): Promise<MedicalEntry | null> {
  return mockRequest(() => {
    const entries = StorageService.get<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES) || [];
    return entries.find((e) => e.id === id) || null;
  });
}

// POST /entries
export async function createEntry(
  entryData: Omit<MedicalEntry, 'id' | 'createdAt'>
): Promise<MedicalEntry> {
  return mockMutation(
    (data) => {
      const entries = StorageService.get<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES) || [];

      const newEntry: MedicalEntry = {
        ...data,
        id: generateEntryId(),
        createdAt: new Date(),
      };

      StorageService.set(StorageKey.MEDICAL_ENTRIES, [...entries, newEntry]);
      return newEntry;
    },
    entryData
  );
}

// PUT /entries/:id
export async function updateEntry(
  id: string,
  updates: Partial<MedicalEntry>
): Promise<MedicalEntry> {
  return mockMutation(
    ({ id, updates }) => {
      const entries = StorageService.get<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES) || [];
      const updatedEntries = entries.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
      );
      StorageService.set(StorageKey.MEDICAL_ENTRIES, updatedEntries);

      const updated = updatedEntries.find((e) => e.id === id);
      if (!updated) throw new Error('Entry not found');
      return updated;
    },
    { id, updates }
  );
}

// GET /labs?bookletId=:bookletId
export async function getLabsByBooklet(bookletId: string): Promise<LabRequest[]> {
  return mockRequest(() => {
    const labRequests = StorageService.get<LabRequest[]>(StorageKey.LAB_REQUESTS) || [];
    return labRequests
      .filter((l) => l.bookletId === bookletId)
      .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
  });
}

// GET /labs?entryId=:entryId
export async function getLabsByEntry(entryId: string): Promise<LabRequest[]> {
  return mockRequest(() => {
    const labRequests = StorageService.get<LabRequest[]>(StorageKey.LAB_REQUESTS) || [];
    return labRequests.filter((l) => l.medicalEntryId === entryId);
  });
}

// GET /labs/pending?bookletId=:bookletId
export async function getPendingLabs(bookletId?: string): Promise<LabRequest[]> {
  return mockRequest(() => {
    const labRequests = StorageService.get<LabRequest[]>(StorageKey.LAB_REQUESTS) || [];
    let pending = labRequests.filter((l) => l.status === 'pending');
    if (bookletId) {
      pending = pending.filter((l) => l.bookletId === bookletId);
    }
    return pending;
  });
}

// POST /labs
export async function createLabRequest(
  labData: Omit<LabRequest, 'id'>
): Promise<LabRequest> {
  return mockMutation(
    (data) => {
      const labRequests = StorageService.get<LabRequest[]>(StorageKey.LAB_REQUESTS) || [];

      const newLab: LabRequest = {
        ...data,
        id: generateLabId(),
      };

      StorageService.set(StorageKey.LAB_REQUESTS, [...labRequests, newLab]);
      return newLab;
    },
    labData
  );
}

// PUT /labs/:id/status
export async function updateLabStatus(
  id: string,
  status: LabStatus,
  results?: string
): Promise<LabRequest> {
  return mockMutation(
    ({ id, status, results }) => {
      const labRequests = StorageService.get<LabRequest[]>(StorageKey.LAB_REQUESTS) || [];
      const updatedLabs = labRequests.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              results: results ?? l.results,
              completedDate: status === 'completed' ? new Date() : l.completedDate,
            }
          : l
      );
      StorageService.set(StorageKey.LAB_REQUESTS, updatedLabs);

      const updated = updatedLabs.find((l) => l.id === id);
      if (!updated) throw new Error('Lab request not found');
      return updated;
    },
    { id, status, results }
  );
}
