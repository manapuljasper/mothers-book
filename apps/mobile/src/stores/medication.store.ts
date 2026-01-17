import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, StorageService, StorageKey } from '../services/storage.service';
import { generateMedicationId, generateIntakeLogId } from '../utils/id.utils';
import { getStartOfDay, isToday } from '../utils/date.utils';
import type {
  Medication,
  MedicationIntakeLog,
  MedicationWithLogs,
  IntakeStatus,
} from '../types';

interface MedicationState {
  // State
  medications: Medication[];
  intakeLogs: MedicationIntakeLog[];

  // Actions
  loadMedications: () => void;
  addMedication: (med: Omit<Medication, 'id' | 'createdAt'>) => string;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deactivateMedication: (id: string) => void;

  // Intake tracking
  logIntake: (
    medicationId: string,
    doseIndex: number,
    status: IntakeStatus,
    userId: string,
    date?: Date
  ) => void;
  updateIntakeLog: (logId: string, status: IntakeStatus) => void;

  // Queries
  getMedicationsByBooklet: (bookletId: string) => MedicationWithLogs[];
  getActiveMedications: (bookletId?: string) => MedicationWithLogs[];
  getTodayMedications: (bookletId?: string) => MedicationWithLogs[];
  getMedicationAdherence: (medicationId: string, days?: number) => number;
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      medications: [],
      intakeLogs: [],

      // Load medications from storage
      loadMedications: () => {
        const medications = StorageService.get<Medication[]>(StorageKey.MEDICATIONS) || [];
        const intakeLogs = StorageService.get<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS) || [];
        set({ medications, intakeLogs });
      },

      // Add medication
      addMedication: (medData) => {
        const id = generateMedicationId();
        const newMed: Medication = {
          ...medData,
          id,
          createdAt: new Date(),
        };

        set((state) => {
          const medications = [...state.medications, newMed];
          StorageService.set(StorageKey.MEDICATIONS, medications);
          return { medications };
        });

        return id;
      },

      // Update medication
      updateMedication: (id, updates) => {
        set((state) => {
          const medications = state.medications.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          );
          StorageService.set(StorageKey.MEDICATIONS, medications);
          return { medications };
        });
      },

      // Deactivate medication
      deactivateMedication: (id) => {
        get().updateMedication(id, { isActive: false });
      },

      // Log medication intake
      logIntake: (medicationId, doseIndex, status, userId, date = new Date()) => {
        const medication = get().medications.find((m) => m.id === medicationId);
        if (!medication) return;

        const scheduledDate = getStartOfDay(date);

        // Check if log already exists for this dose on this day
        const existingLog = get().intakeLogs.find(
          (l) =>
            l.medicationId === medicationId &&
            l.doseIndex === doseIndex &&
            getStartOfDay(new Date(l.scheduledDate)).getTime() === scheduledDate.getTime()
        );

        if (existingLog) {
          // Update existing log
          get().updateIntakeLog(existingLog.id, status);
          return;
        }

        const newLog: MedicationIntakeLog = {
          id: generateIntakeLogId(),
          medicationId,
          scheduledDate,
          doseIndex,
          status,
          takenAt: status === 'taken' ? new Date() : undefined,
          recordedByUserId: userId,
          createdAt: new Date(),
        };

        set((state) => {
          const intakeLogs = [...state.intakeLogs, newLog];
          StorageService.set(StorageKey.INTAKE_LOGS, intakeLogs);
          return { intakeLogs };
        });
      },

      // Update intake log
      updateIntakeLog: (logId, status) => {
        set((state) => {
          const intakeLogs = state.intakeLogs.map((l) =>
            l.id === logId
              ? {
                  ...l,
                  status,
                  takenAt: status === 'taken' ? new Date() : undefined,
                }
              : l
          );
          StorageService.set(StorageKey.INTAKE_LOGS, intakeLogs);
          return { intakeLogs };
        });
      },

      // Get medications by booklet with logs
      getMedicationsByBooklet: (bookletId) => {
        const { medications, intakeLogs } = get();
        const today = getStartOfDay();

        return medications
          .filter((m) => m.bookletId === bookletId)
          .map((m) => {
            const logs = intakeLogs.filter((l) => l.medicationId === m.id);
            const todayLogs = logs.filter((l) =>
              isToday(new Date(l.scheduledDate))
            );

            return {
              ...m,
              intakeLogs: logs,
              todayLogs,
              adherenceRate: calculateAdherence(m, logs),
            } as MedicationWithLogs;
          });
      },

      // Get active medications
      getActiveMedications: (bookletId) => {
        const { medications, intakeLogs } = get();

        let active = medications.filter((m) => m.isActive);
        if (bookletId) {
          active = active.filter((m) => m.bookletId === bookletId);
        }

        return active.map((m) => {
          const logs = intakeLogs.filter((l) => l.medicationId === m.id);
          const todayLogs = logs.filter((l) => isToday(new Date(l.scheduledDate)));

          return {
            ...m,
            intakeLogs: logs,
            todayLogs,
            adherenceRate: calculateAdherence(m, logs),
          } as MedicationWithLogs;
        });
      },

      // Get today's medications
      getTodayMedications: (bookletId) => {
        return get().getActiveMedications(bookletId);
      },

      // Get medication adherence rate
      getMedicationAdherence: (medicationId, days = 7) => {
        const medication = get().medications.find((m) => m.id === medicationId);
        if (!medication) return 0;

        const logs = get().intakeLogs.filter((l) => l.medicationId === medicationId);
        return calculateAdherence(medication, logs, days);
      },
    }),
    {
      name: 'medication-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        medications: state.medications,
        intakeLogs: state.intakeLogs,
      }),
    }
  )
);

// Helper function to calculate adherence rate
function calculateAdherence(
  medication: Medication,
  logs: MedicationIntakeLog[],
  days: number = 7
): number {
  const today = getStartOfDay();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  // Calculate expected doses in the period
  const medStartDate = new Date(medication.startDate);
  const effectiveStartDate = medStartDate > startDate ? medStartDate : startDate;

  const daysDiff = Math.ceil(
    (today.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff <= 0) return 100; // Medication just started

  const expectedDoses = daysDiff * medication.frequencyPerDay;

  // Count taken doses in the period
  const takenDoses = logs.filter((l) => {
    const logDate = new Date(l.scheduledDate);
    return l.status === 'taken' && logDate >= effectiveStartDate && logDate <= today;
  }).length;

  return Math.round((takenDoses / expectedDoses) * 100);
}
