import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, StorageService, StorageKey } from '../services/storage.service';
import { generateEntryId, generateLabId } from '../utils/id.utils';
import type {
  MedicalEntry,
  LabRequest,
  MedicalEntryWithDoctor,
  DoctorProfile,
  EntryType,
  LabStatus,
} from '../types';

interface MedicalState {
  // State
  entries: MedicalEntry[];
  labRequests: LabRequest[];

  // Actions
  loadMedicalData: () => void;
  addEntry: (entry: Omit<MedicalEntry, 'id' | 'createdAt'>) => string;
  updateEntry: (id: string, updates: Partial<MedicalEntry>) => void;

  // Lab requests
  addLabRequest: (lab: Omit<LabRequest, 'id'>) => string;
  updateLabStatus: (id: string, status: LabStatus, results?: string) => void;

  // Queries
  getEntriesByBooklet: (bookletId: string) => MedicalEntryWithDoctor[];
  getEntryById: (id: string) => MedicalEntry | null;
  getLabsByBooklet: (bookletId: string) => LabRequest[];
  getLabsByEntry: (entryId: string) => LabRequest[];
  getPendingLabs: (bookletId?: string) => LabRequest[];
}

export const useMedicalStore = create<MedicalState>()(
  persist(
    (set, get) => ({
      entries: [],
      labRequests: [],

      // Load medical data from storage
      loadMedicalData: () => {
        const entries = StorageService.get<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES) || [];
        const labRequests = StorageService.get<LabRequest[]>(StorageKey.LAB_REQUESTS) || [];
        set({ entries, labRequests });
      },

      // Add new medical entry
      addEntry: (entryData) => {
        const id = generateEntryId();
        const newEntry: MedicalEntry = {
          ...entryData,
          id,
          createdAt: new Date(),
        };

        set((state) => {
          const entries = [...state.entries, newEntry];
          StorageService.set(StorageKey.MEDICAL_ENTRIES, entries);
          return { entries };
        });

        return id;
      },

      // Update entry
      updateEntry: (id, updates) => {
        set((state) => {
          const entries = state.entries.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
          );
          StorageService.set(StorageKey.MEDICAL_ENTRIES, entries);
          return { entries };
        });
      },

      // Add lab request
      addLabRequest: (labData) => {
        const id = generateLabId();
        const newLab: LabRequest = {
          ...labData,
          id,
        };

        set((state) => {
          const labRequests = [...state.labRequests, newLab];
          StorageService.set(StorageKey.LAB_REQUESTS, labRequests);
          return { labRequests };
        });

        return id;
      },

      // Update lab status
      updateLabStatus: (id, status, results) => {
        set((state) => {
          const labRequests = state.labRequests.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status,
                  results: results ?? l.results,
                  completedDate: status === 'completed' ? new Date() : l.completedDate,
                }
              : l
          );
          StorageService.set(StorageKey.LAB_REQUESTS, labRequests);
          return { labRequests };
        });
      },

      // Get entries by booklet with doctor info
      getEntriesByBooklet: (bookletId) => {
        const { entries } = get();
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
      },

      // Get entry by ID
      getEntryById: (id) => {
        return get().entries.find((e) => e.id === id) || null;
      },

      // Get labs by booklet
      getLabsByBooklet: (bookletId) => {
        return get()
          .labRequests.filter((l) => l.bookletId === bookletId)
          .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
      },

      // Get labs by entry
      getLabsByEntry: (entryId) => {
        return get().labRequests.filter((l) => l.medicalEntryId === entryId);
      },

      // Get pending labs
      getPendingLabs: (bookletId) => {
        const { labRequests } = get();
        let pending = labRequests.filter((l) => l.status === 'pending');
        if (bookletId) {
          pending = pending.filter((l) => l.bookletId === bookletId);
        }
        return pending;
      },
    }),
    {
      name: 'medical-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        entries: state.entries,
        labRequests: state.labRequests,
      }),
    }
  )
);
