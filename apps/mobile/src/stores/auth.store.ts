import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "../services/storage.service";

type Role = "doctor" | "mother";

interface AuthStore {
  selectedRole: Role | null;
  pendingBirthdate: number | null; // Temp storage for mother birthdate during signup
  setSelectedRole: (role: Role) => void;
  setPendingBirthdate: (ts: number) => void;
  clearPendingBirthdate: () => void;
  clearRole: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      selectedRole: null,
      pendingBirthdate: null,
      setSelectedRole: (role) => set({ selectedRole: role }),
      setPendingBirthdate: (ts) => set({ pendingBirthdate: ts }),
      clearPendingBirthdate: () => set({ pendingBirthdate: null }),
      clearRole: () => set({ selectedRole: null, pendingBirthdate: null }),
    }),
    {
      name: "auth-role-storage",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        selectedRole: state.selectedRole,
        pendingBirthdate: state.pendingBirthdate,
      }),
    }
  )
);
