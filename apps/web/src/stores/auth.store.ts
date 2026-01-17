import { create } from "zustand";
import { Doc } from "@convex/_generated/dataModel";

type UserRole = "doctor" | "mother" | "super_admin" | null;

interface AuthState {
  // Current role selection (for users with multiple profiles)
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;

  // Computed role based on profiles
  detectRole: (
    doctorProfile: Doc<"doctorProfiles"> | null,
    motherProfile: Doc<"motherProfiles"> | null,
    superAdminProfile: Doc<"superAdminProfiles"> | null
  ) => UserRole;
}

export const useAuthStore = create<AuthState>((set) => ({
  selectedRole: null,

  setSelectedRole: (role) => set({ selectedRole: role }),

  detectRole: (doctorProfile, motherProfile, superAdminProfile) => {
    // Priority: super_admin > doctor > mother
    if (superAdminProfile) return "super_admin";
    if (doctorProfile) return "doctor";
    if (motherProfile) return "mother";
    return null;
  },
}));
