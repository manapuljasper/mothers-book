/**
 * Auth Store (State Only)
 *
 * Holds authentication state. All async operations are handled
 * by auth hooks (src/hooks/auth) which call the auth service.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../services/storage.service';
import type { User, UserRole, DoctorProfile, MotherProfile } from '../types';

interface AuthState {
  // State
  currentUser: User | null;
  currentRole: UserRole | null;
  doctorProfile: DoctorProfile | null;
  motherProfile: MotherProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Simple setters (called by auth hooks)
  setAuth: (data: {
    user: User;
    role: UserRole | null;
    doctorProfile: DoctorProfile | null;
    motherProfile: MotherProfile | null;
  }) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      currentRole: null,
      doctorProfile: null,
      motherProfile: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      // Set auth data (called on successful login/signup)
      setAuth: ({ user, role, doctorProfile, motherProfile }) => {
        set({
          currentUser: user,
          currentRole: role,
          doctorProfile,
          motherProfile,
          isAuthenticated: true,
        });
      },

      // Clear all auth data (called on logout)
      clearAuth: () => {
        set({
          currentUser: null,
          currentRole: null,
          doctorProfile: null,
          motherProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set initialized state
      setInitialized: (initialized) => {
        set({ isInitialized: initialized });
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
