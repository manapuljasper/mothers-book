import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "../services/storage.service";

type Role = "doctor" | "mother";

interface AuthStore {
  selectedRole: Role | null;
  setSelectedRole: (role: Role) => void;
  clearRole: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      selectedRole: null,
      setSelectedRole: (role) => set({ selectedRole: role }),
      clearRole: () => set({ selectedRole: null }),
    }),
    {
      name: "auth-role-storage",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ selectedRole: state.selectedRole }),
    }
  )
);
