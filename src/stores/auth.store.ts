import { create } from "zustand";

type Role = "doctor" | "mother";

interface AuthStore {
  selectedRole: Role | null;
  setSelectedRole: (role: Role) => void;
  clearRole: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  selectedRole: null,
  setSelectedRole: (role) => set({ selectedRole: role }),
  clearRole: () => set({ selectedRole: null }),
}));
