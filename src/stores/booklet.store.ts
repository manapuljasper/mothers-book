import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, StorageService, StorageKey } from '../services/storage.service';
import { generateBookletId, generateAccessId } from '../utils/id.utils';
import type {
  MotherBooklet,
  BookletAccess,
  BookletWithMother,
  DoctorProfile,
  MotherProfile,
} from '../types';

interface BookletState {
  // State
  booklets: MotherBooklet[];
  accessRecords: BookletAccess[];

  // Actions
  loadBooklets: () => void;
  addBooklet: (booklet: Omit<MotherBooklet, 'id' | 'createdAt'>) => string;
  updateBooklet: (id: string, updates: Partial<MotherBooklet>) => void;
  archiveBooklet: (id: string) => void;

  // Access management
  grantAccess: (bookletId: string, doctorId: string) => void;
  revokeAccess: (bookletId: string, doctorId: string) => void;

  // Queries
  getBookletsByMother: (motherId: string) => MotherBooklet[];
  getBookletsByDoctor: (doctorId: string) => BookletWithMother[];
  getBookletById: (id: string) => MotherBooklet | null;
  getAccessibleDoctors: (bookletId: string) => DoctorProfile[];
}

export const useBookletStore = create<BookletState>()(
  persist(
    (set, get) => ({
      booklets: [],
      accessRecords: [],

      // Load booklets from storage
      loadBooklets: () => {
        const booklets = StorageService.get<MotherBooklet[]>(StorageKey.BOOKLETS) || [];
        const accessRecords = StorageService.get<BookletAccess[]>(StorageKey.BOOKLET_ACCESS) || [];
        set({ booklets, accessRecords });
      },

      // Add a new booklet
      addBooklet: (bookletData) => {
        const id = generateBookletId();
        const newBooklet: MotherBooklet = {
          ...bookletData,
          id,
          createdAt: new Date(),
        };

        set((state) => {
          const booklets = [...state.booklets, newBooklet];
          StorageService.set(StorageKey.BOOKLETS, booklets);
          return { booklets };
        });

        return id;
      },

      // Update booklet
      updateBooklet: (id, updates) => {
        set((state) => {
          const booklets = state.booklets.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          );
          StorageService.set(StorageKey.BOOKLETS, booklets);
          return { booklets };
        });
      },

      // Archive booklet
      archiveBooklet: (id) => {
        get().updateBooklet(id, { status: 'archived' });
      },

      // Grant doctor access to booklet
      grantAccess: (bookletId, doctorId) => {
        const { accessRecords } = get();

        // Check if access already exists and is not revoked
        const existingAccess = accessRecords.find(
          (a) => a.bookletId === bookletId && a.doctorId === doctorId && !a.revokedAt
        );

        if (existingAccess) {
          console.log('Access already granted');
          return;
        }

        const newAccess: BookletAccess = {
          id: generateAccessId(),
          bookletId,
          doctorId,
          grantedAt: new Date(),
          revokedAt: null,
        };

        set((state) => {
          const accessRecords = [...state.accessRecords, newAccess];
          StorageService.set(StorageKey.BOOKLET_ACCESS, accessRecords);
          return { accessRecords };
        });
      },

      // Revoke doctor access
      revokeAccess: (bookletId, doctorId) => {
        set((state) => {
          const accessRecords = state.accessRecords.map((a) =>
            a.bookletId === bookletId && a.doctorId === doctorId && !a.revokedAt
              ? { ...a, revokedAt: new Date() }
              : a
          );
          StorageService.set(StorageKey.BOOKLET_ACCESS, accessRecords);
          return { accessRecords };
        });
      },

      // Get booklets by mother
      getBookletsByMother: (motherId) => {
        return get().booklets.filter((b) => b.motherId === motherId);
      },

      // Get booklets accessible by doctor (with mother info)
      getBookletsByDoctor: (doctorId) => {
        const { booklets, accessRecords } = get();
        const mothers = StorageService.get<MotherProfile[]>(StorageKey.MOTHER_PROFILES) || [];
        const medicalEntries = StorageService.get<any[]>(StorageKey.MEDICAL_ENTRIES) || [];

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
      },

      // Get booklet by ID
      getBookletById: (id) => {
        return get().booklets.find((b) => b.id === id) || null;
      },

      // Get doctors with access to booklet
      getAccessibleDoctors: (bookletId) => {
        const { accessRecords } = get();
        const doctors = StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES) || [];

        const accessibleDoctorIds = accessRecords
          .filter((a) => a.bookletId === bookletId && !a.revokedAt)
          .map((a) => a.doctorId);

        return doctors.filter((d) => accessibleDoctorIds.includes(d.id));
      },
    }),
    {
      name: 'booklet-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        booklets: state.booklets,
        accessRecords: state.accessRecords,
      }),
    }
  )
);
