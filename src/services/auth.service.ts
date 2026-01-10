/**
 * Auth Service
 * Handles all authentication operations with Supabase.
 */

import { supabase } from "../lib/supabase";
import type { User, UserRole, DoctorProfile, MotherProfile } from "../types";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface SignInResult extends AuthResult {
  user?: User;
  role?: UserRole;
  doctorProfile?: DoctorProfile | null;
  motherProfile?: MotherProfile | null;
}

export interface UserProfileData {
  user: User | null;
  role: UserRole | null;
  doctorProfile: DoctorProfile | null;
  motherProfile: MotherProfile | null;
}

/**
 * Fetch user profile data from Supabase
 */
export async function fetchUserProfile(
  userId: string,
  email?: string
): Promise<UserProfileData> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return { user: null, role: null, doctorProfile: null, motherProfile: null };
    }

    const user: User = {
      id: profile.id,
      email: email || "",
      role: profile.role as UserRole,
      fullName: profile.full_name,
      createdAt: new Date(profile.created_at),
    };

    const role = profile.role as UserRole;
    let doctorProfile: DoctorProfile | null = null;
    let motherProfile: MotherProfile | null = null;

    if (role === "doctor") {
      const { data: doctor } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (doctor) {
        doctorProfile = {
          id: doctor.id,
          userId: doctor.user_id,
          prcNumber: doctor.prc_number,
          clinicName: doctor.clinic_name,
          clinicAddress: doctor.clinic_address || "",
          contactNumber: profile.contact_number || "",
          specialization: doctor.specialization,
          avatarUrl: profile.avatar_url,
          clinicSchedule: doctor.clinic_schedule,
          latitude: doctor.latitude,
          longitude: doctor.longitude,
        };
      }
    } else if (role === "mother") {
      const { data: mother } = await supabase
        .from("mother_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (mother) {
        motherProfile = {
          id: mother.id,
          userId: mother.user_id,
          birthdate: mother.birthdate ? new Date(mother.birthdate) : new Date(),
          contactNumber: profile.contact_number,
          address: mother.address,
          emergencyContact: mother.emergency_contact_number,
          emergencyContactName: mother.emergency_contact_name,
          avatarUrl: profile.avatar_url,
          babyName: mother.baby_name,
        };
      }
    }

    return { user, role, doctorProfile, motherProfile };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { user: null, role: null, doctorProfile: null, motherProfile: null };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "No user returned from sign in" };
    }

    const profileData = await fetchUserProfile(data.user.id, data.user.email || email);

    if (!profileData.user) {
      return { success: false, error: "Failed to load user profile" };
    }

    return {
      success: true,
      user: profileData.user,
      role: profileData.role ?? undefined,
      doctorProfile: profileData.doctorProfile,
      motherProfile: profileData.motherProfile,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sign up - creates auth user, profile created by trigger
 * Returns user data immediately (profile fetched later)
 */
export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  fullName: string,
  extraData: Record<string, unknown> = {}
): Promise<SignInResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          ...extraData,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "No user returned from sign up" };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || email,
      role: role,
      fullName: fullName,
      createdAt: new Date(data.user.created_at || Date.now()),
    };

    return {
      success: true,
      user,
      role,
      doctorProfile: null,
      motherProfile: null,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return null;
    }
    return data.session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Initialize auth - check for existing session and load profile
 */
export async function initializeAuth(): Promise<SignInResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false };
    }

    const profileData = await fetchUserProfile(
      session.user.id,
      session.user.email || ""
    );

    if (!profileData.user) {
      return { success: false, error: "No profile found" };
    }

    return {
      success: true,
      user: profileData.user,
      role: profileData.role ?? undefined,
      doctorProfile: profileData.doctorProfile,
      motherProfile: profileData.motherProfile,
    };
  } catch (error) {
    console.error("Initialize auth error:", error);
    return { success: false, error: "Failed to initialize auth" };
  }
}
