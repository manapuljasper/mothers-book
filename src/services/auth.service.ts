/**
 * Auth Service
 * Handles all authentication operations with Supabase.
 * This service is called by React Query hooks, not directly by components.
 */

import { supabase } from "../lib/supabase";
import type { User, UserRole, DoctorProfile, MotherProfile } from "../types";

/**
 * Retry configuration for profile fetching
 */
const PROFILE_FETCH_CONFIG = {
  maxAttempts: 10,
  initialDelayMs: 100,
  maxDelayMs: 2000,
};

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
 * Wait for profile to be created by database trigger with exponential backoff
 * Returns the profile data once it exists, or null if max attempts exceeded
 */
async function waitForProfile(
  userId: string,
  email: string
): Promise<UserProfileData> {
  const { maxAttempts, initialDelayMs, maxDelayMs } = PROFILE_FETCH_CONFIG;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const profileData = await fetchUserProfile(userId, email);

    if (profileData.user) {
      console.log(
        `[Auth] Profile found on attempt ${attempt} for userId:`,
        userId
      );
      return profileData;
    }

    if (attempt < maxAttempts) {
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, 2000ms (capped)
      const delay = Math.min(initialDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      console.log(
        `[Auth] Profile not found, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.warn(
    `[Auth] Profile not found after ${maxAttempts} attempts for userId:`,
    userId
  );
  return { user: null, role: null, doctorProfile: null, motherProfile: null };
}

/**
 * Fetch user profile data from Supabase
 * Returns user, role, and role-specific profile
 */
export async function fetchUserProfile(
  userId: string,
  email?: string
): Promise<UserProfileData> {
  try {
    console.log("[Auth] Fetching profile for userId:", userId);

    // Get base profile - use maybeSingle to handle missing profiles gracefully
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    console.log("[Auth] Profile query result:", {
      profile,
      error: profileError,
    });

    if (profileError) {
      console.error(
        "[Auth] Error fetching profile:",
        profileError.message,
        profileError
      );
      return {
        user: null,
        role: null,
        doctorProfile: null,
        motherProfile: null,
      };
    }

    if (!profile) {
      console.warn("[Auth] No profile found for user:", userId);
      return {
        user: null,
        role: null,
        doctorProfile: null,
        motherProfile: null,
      };
    }

    const user: User = {
      id: profile.id,
      email: email || "",
      role: profile.role as UserRole,
      createdAt: new Date(profile.created_at),
    };

    const role = profile.role as UserRole;
    let doctorProfile: DoctorProfile | null = null;
    let motherProfile: MotherProfile | null = null;

    if (role === "doctor") {
      console.log("[Auth] Fetching doctor profile for userId:", userId);
      const { data: doctor, error: doctorError } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("[Auth] Doctor profile query result:", {
        doctor,
        error: doctorError,
      });

      if (doctorError) {
        console.error(
          "[Auth] Error fetching doctor profile:",
          doctorError.message,
          doctorError
        );
      } else if (doctor) {
        doctorProfile = {
          id: doctor.id,
          userId: doctor.user_id,
          fullName: profile.full_name,
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
      console.log("[Auth] Fetching mother profile for userId:", userId);
      const { data: mother, error: motherError } = await supabase
        .from("mother_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("[Auth] Mother profile query result:", {
        mother,
        error: motherError,
      });

      if (motherError) {
        console.error(
          "[Auth] Error fetching mother profile:",
          motherError.message,
          motherError
        );
      } else if (mother) {
        motherProfile = {
          id: mother.id,
          userId: mother.user_id,
          fullName: profile.full_name,
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
    console.error("Unexpected error fetching user profile:", error);
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
    console.log("[Auth] Signing in with email:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth] Sign in auth error:", error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.error("[Auth] No user returned from sign in");
      return { success: false, error: "No user returned from sign in" };
    }

    console.log("[Auth] Auth successful, user id:", data.user.id);
    console.log("[Auth] Fetching user profile...");

    const profileData = await fetchUserProfile(
      data.user.id,
      data.user.email || email
    );

    console.log("[Auth] Profile data result:", {
      hasUser: !!profileData.user,
      role: profileData.role,
      hasDoctorProfile: !!profileData.doctorProfile,
      hasMotherProfile: !!profileData.motherProfile,
    });

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
    console.error("[Auth] Sign in unexpected error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sign up with email, password, role, and full name
 */
export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  fullName: string,
  extraData: Record<string, unknown> = {}
): Promise<SignInResult> {
  try {
    console.log("[Auth] Signing up user:", email);

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
      console.error("[Auth] Sign up error:", error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "No user returned from sign up" };
    }

    console.log("[Auth] User created, waiting for profile:", data.user.id);

    // Wait for the database trigger to create the profile with retry logic
    const profileData = await waitForProfile(
      data.user.id,
      data.user.email || email
    );

    if (!profileData.user) {
      // Profile creation failed after all retries
      // Return error so user knows to try again
      console.error(
        "[Auth] Profile not created after retries for user:",
        data.user.id
      );
      return {
        success: false,
        error: "Account created but profile setup failed. Please try signing in.",
      };
    }

    return {
      success: true,
      user: profileData.user,
      role: profileData.role ?? undefined,
      doctorProfile: profileData.doctorProfile,
      motherProfile: profileData.motherProfile,
    };
  } catch (error) {
    console.error("[Auth] Sign up unexpected error:", error);
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
      console.error("Sign out error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected sign out error:", error);
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
      console.error("Get session error:", error.message);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error("Unexpected get session error:", error);
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
