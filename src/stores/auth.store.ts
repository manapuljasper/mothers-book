import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, StorageService, StorageKey } from '../services/storage.service';
import type { User, UserRole, DoctorProfile, MotherProfile } from '../types';

interface AuthState {
  // State
  currentUser: User | null;
  currentRole: UserRole | null;
  doctorProfile: DoctorProfile | null;
  motherProfile: MotherProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string) => boolean;
  loginAsDoctor: (doctorId: string) => void;
  loginAsMother: (motherId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      currentRole: null,
      doctorProfile: null,
      motherProfile: null,
      isAuthenticated: false,
      isLoading: false,

      // Login by email - finds user in sample data
      login: (email: string) => {
        const users = StorageService.get<User[]>(StorageKey.USERS) || [];
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
          return false;
        }

        set({ currentUser: user, currentRole: user.role, isAuthenticated: true });

        // Load profile based on role
        if (user.role === 'doctor') {
          const doctors = StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES) || [];
          const doctorProfile = doctors.find((d) => d.userId === user.id);
          set({ doctorProfile, motherProfile: null });
        } else {
          const mothers = StorageService.get<MotherProfile[]>(StorageKey.MOTHER_PROFILES) || [];
          const motherProfile = mothers.find((m) => m.userId === user.id);
          set({ motherProfile, doctorProfile: null });
        }

        return true;
      },

      // Quick login as a specific doctor (for development)
      loginAsDoctor: (doctorId: string) => {
        const doctors = StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES) || [];
        const doctorProfile = doctors.find((d) => d.id === doctorId);

        if (!doctorProfile) return;

        const users = StorageService.get<User[]>(StorageKey.USERS) || [];
        const user = users.find((u) => u.id === doctorProfile.userId);

        if (!user) return;

        set({
          currentUser: user,
          currentRole: 'doctor',
          doctorProfile,
          motherProfile: null,
          isAuthenticated: true,
        });
      },

      // Quick login as a specific mother (for development)
      loginAsMother: (motherId: string) => {
        const mothers = StorageService.get<MotherProfile[]>(StorageKey.MOTHER_PROFILES) || [];
        const motherProfile = mothers.find((m) => m.id === motherId);

        if (!motherProfile) return;

        const users = StorageService.get<User[]>(StorageKey.USERS) || [];
        const user = users.find((u) => u.id === motherProfile.userId);

        if (!user) return;

        set({
          currentUser: user,
          currentRole: 'mother',
          motherProfile,
          doctorProfile: null,
          isAuthenticated: true,
        });
      },

      // Logout
      logout: () => {
        set({
          currentUser: null,
          currentRole: null,
          doctorProfile: null,
          motherProfile: null,
          isAuthenticated: false,
        });
      },

      // Switch role (for development/testing)
      switchRole: (role: UserRole) => {
        const { currentRole } = get();
        if (currentRole === role) return;

        // For now, just logout and let user re-login
        // In a real app, this would handle role switching differently
        set({ currentRole: role });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentRole: state.currentRole,
        doctorProfile: state.doctorProfile,
        motherProfile: state.motherProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectIsDoctor = (state: AuthState) => state.currentRole === 'doctor';
export const selectIsMother = (state: AuthState) => state.currentRole === 'mother';
export const selectCurrentDoctorId = (state: AuthState) => state.doctorProfile?.id ?? null;
export const selectCurrentMotherId = (state: AuthState) => state.motherProfile?.id ?? null;
