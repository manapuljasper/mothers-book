/**
 * Medications API
 *
 * Mock API endpoints for medication operations.
 * Replace implementations with real API calls when backend is ready.
 */

import { mockRequest, mockMutation } from './client';
import { StorageService, StorageKey } from '../services/storage.service';
import { generateMedicationId, generateIntakeLogId } from '../utils/id.utils';
import { getStartOfDay, isToday } from '../utils/date.utils';
import type {
  Medication,
  MedicationIntakeLog,
  MedicationWithLogs,
  IntakeStatus,
} from '../types';

// Helper function to calculate adherence rate
function calculateAdherence(
  medication: Medication,
  logs: MedicationIntakeLog[],
  days: number = 7
): number {
  const today = getStartOfDay();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const medStartDate = new Date(medication.startDate);
  const effectiveStartDate = medStartDate > startDate ? medStartDate : startDate;

  const daysDiff = Math.ceil(
    (today.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff <= 0) return 100;

  const expectedDoses = daysDiff * medication.frequencyPerDay;

  const takenDoses = logs.filter((l) => {
    const logDate = new Date(l.takenDate);
    return l.status === 'taken' && logDate >= effectiveStartDate && logDate <= today;
  }).length;

  return Math.round((takenDoses / expectedDoses) * 100);
}

// Helper to enrich medication with logs
function enrichMedicationWithLogs(
  medication: Medication,
  allLogs: MedicationIntakeLog[]
): MedicationWithLogs {
  const logs = allLogs.filter((l) => l.medicationId === medication.id);
  const todayLogs = logs.filter((l) => isToday(new Date(l.takenDate)));

  return {
    ...medication,
    intakeLogs: logs,
    todayLogs,
    adherenceRate: calculateAdherence(medication, logs),
  };
}

// GET /medications?bookletId=:bookletId
export async function getMedicationsByBooklet(bookletId: string): Promise<MedicationWithLogs[]> {
  return mockRequest(() => {
    const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
    const intakeLogs = StorageService.get<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS) || [];

    return medications
      .filter((m) => m.bookletId === bookletId)
      .map((m) => enrichMedicationWithLogs(m, intakeLogs));
  });
}

// GET /medications/active?bookletId=:bookletId
export async function getActiveMedications(bookletId?: string): Promise<MedicationWithLogs[]> {
  return mockRequest(() => {
    const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
    const intakeLogs = StorageService.get<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS) || [];

    let active = medications.filter((m) => m.isActive);
    if (bookletId) {
      active = active.filter((m) => m.bookletId === bookletId);
    }

    return active.map((m) => enrichMedicationWithLogs(m, intakeLogs));
  });
}

// GET /medications/today?bookletId=:bookletId
export async function getTodayMedications(bookletId?: string): Promise<MedicationWithLogs[]> {
  return getActiveMedications(bookletId);
}

// GET /medications/:id
export async function getMedicationById(id: string): Promise<Medication | null> {
  return mockRequest(() => {
    const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
    return medications.find((m) => m.id === id) || null;
  });
}

// GET /medications?entryId=:entryId
export async function getMedicationsByEntry(entryId: string): Promise<Medication[]> {
  return mockRequest(() => {
    const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
    return medications.filter((m) => m.medicalEntryId === entryId);
  });
}

// POST /medications
export async function createMedication(
  medData: Omit<Medication, 'id' | 'createdAt'>
): Promise<Medication> {
  return mockMutation(
    (data) => {
      const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];

      const newMed: Medication = {
        ...data,
        id: generateMedicationId(),
        createdAt: new Date(),
      };

      StorageService.set(StorageKey.MEDICATIONS, [...medications, newMed]);
      return newMed;
    },
    medData
  );
}

// PUT /medications/:id
export async function updateMedication(
  id: string,
  updates: Partial<Medication>
): Promise<Medication> {
  return mockMutation(
    ({ id, updates }) => {
      const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
      const updatedMeds = medications.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      StorageService.set(StorageKey.MEDICATIONS, updatedMeds);

      const updated = updatedMeds.find((m) => m.id === id);
      if (!updated) throw new Error('Medication not found');
      return updated;
    },
    { id, updates }
  );
}

// PUT /medications/:id/deactivate
export async function deactivateMedication(id: string): Promise<Medication> {
  return updateMedication(id, { isActive: false });
}

// POST /medications/:medicationId/intake
export async function logIntake(
  medicationId: string,
  doseIndex: number,
  status: IntakeStatus,
  userId: string,
  date: Date = new Date()
): Promise<MedicationIntakeLog> {
  return mockMutation(
    ({ medicationId, doseIndex, status, userId, date }) => {
      const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
      const intakeLogs = StorageService.get<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS) || [];

      const medication = medications.find((m) => m.id === medicationId);
      if (!medication) throw new Error('Medication not found');

      const takenDate = getStartOfDay(date);

      // Check if log already exists for this dose on this day
      const existingLogIndex = intakeLogs.findIndex(
        (l) =>
          l.medicationId === medicationId &&
          l.doseIndex === doseIndex &&
          getStartOfDay(new Date(l.takenDate)).getTime() === takenDate.getTime()
      );

      if (existingLogIndex !== -1) {
        // Update existing log
        const updatedLogs = [...intakeLogs];
        updatedLogs[existingLogIndex] = {
          ...updatedLogs[existingLogIndex],
          status,
          takenAt: status === 'taken' ? new Date() : undefined,
        };
        StorageService.set(StorageKey.INTAKE_LOGS, updatedLogs);
        return updatedLogs[existingLogIndex];
      }

      const newLog: MedicationIntakeLog = {
        id: generateIntakeLogId(),
        medicationId,
        medicalEntryId: medication.medicalEntryId,
        bookletId: medication.bookletId,
        takenDate,
        doseIndex,
        status,
        takenAt: status === 'taken' ? new Date() : undefined,
        recordedByUserId: userId,
        createdAt: new Date(),
      };

      StorageService.set(StorageKey.INTAKE_LOGS, [...intakeLogs, newLog]);
      return newLog;
    },
    { medicationId, doseIndex, status, userId, date }
  );
}

// GET /medications/:medicationId/adherence?days=:days
export async function getMedicationAdherence(
  medicationId: string,
  days: number = 7
): Promise<number> {
  return mockRequest(() => {
    const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
    const intakeLogs = StorageService.get<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS) || [];

    const medication = medications.find((m) => m.id === medicationId);
    if (!medication) return 0;

    const logs = intakeLogs.filter((l) => l.medicationId === medicationId);
    return calculateAdherence(medication, logs, days);
  });
}
