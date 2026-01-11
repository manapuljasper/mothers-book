/**
 * Profile API
 *
 * Supabase operations for updating user profiles.
 */

import { supabase, handleSupabaseError, toSnakeCase } from "./client";
import type { DoctorProfile, MotherProfile } from "../types";

interface UpdateDoctorProfileInput {
  fullName?: string;
  contactNumber?: string;
  prcNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
  specialization?: string;
  clinicSchedule?: string;
}

interface UpdateMotherProfileInput {
  fullName?: string;
  contactNumber?: string;
  birthdate?: Date;
  address?: string;
  emergencyContactName?: string;
  emergencyContact?: string;
  babyName?: string;
}

/**
 * Update doctor profile
 * Updates both profiles table (fullName, contactNumber) and doctor_profiles table
 */
export async function updateDoctorProfile(
  doctorId: string,
  userId: string,
  data: UpdateDoctorProfileInput
): Promise<DoctorProfile> {
  // Separate fields for profiles table vs doctor_profiles table
  const { fullName, contactNumber, ...doctorData } = data;

  // Update profiles table if needed
  if (fullName !== undefined || contactNumber !== undefined) {
    const profileUpdates: Record<string, unknown> = {};
    if (fullName !== undefined) profileUpdates.full_name = fullName;
    if (contactNumber !== undefined) profileUpdates.contact_number = contactNumber;

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (profileError) handleSupabaseError(profileError);
  }

  // Update doctor_profiles table if there's data to update
  if (Object.keys(doctorData).length > 0) {
    const snakeCaseData = toSnakeCase(doctorData as Record<string, unknown>);

    const { error: doctorError } = await supabase
      .from("doctor_profiles")
      .update(snakeCaseData)
      .eq("id", doctorId);

    if (doctorError) handleSupabaseError(doctorError);
  }

  // Fetch and return updated profile
  const { data: doctor, error: fetchError } = await supabase
    .from("doctor_profiles")
    .select("*, profiles!user_id(full_name, contact_number, avatar_url)")
    .eq("id", doctorId)
    .single();

  if (fetchError) handleSupabaseError(fetchError);

  const profile = doctor.profiles as Record<string, unknown> | null;
  return {
    id: doctor.id,
    userId: doctor.user_id,
    prcNumber: doctor.prc_number,
    clinicName: doctor.clinic_name,
    clinicAddress: doctor.clinic_address || "",
    contactNumber: (profile?.contact_number as string) || "",
    specialization: doctor.specialization,
    avatarUrl: profile?.avatar_url as string | undefined,
    clinicSchedule: doctor.clinic_schedule,
    latitude: doctor.latitude,
    longitude: doctor.longitude,
    fullName: (profile?.full_name as string) || "",
  };
}

/**
 * Update mother profile
 * Updates both profiles table (fullName, contactNumber) and mother_profiles table
 */
export async function updateMotherProfile(
  motherId: string,
  userId: string,
  data: UpdateMotherProfileInput
): Promise<MotherProfile> {
  // Separate fields for profiles table vs mother_profiles table
  const { fullName, contactNumber, emergencyContact, ...motherData } = data;

  // Update profiles table if needed
  if (fullName !== undefined || contactNumber !== undefined) {
    const profileUpdates: Record<string, unknown> = {};
    if (fullName !== undefined) profileUpdates.full_name = fullName;
    if (contactNumber !== undefined) profileUpdates.contact_number = contactNumber;

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (profileError) handleSupabaseError(profileError);
  }

  // Update mother_profiles table if there's data to update
  const motherUpdateData: Record<string, unknown> = {};
  if (motherData.birthdate !== undefined) {
    motherUpdateData.birthdate = motherData.birthdate.toISOString().split("T")[0];
  }
  if (motherData.address !== undefined) {
    motherUpdateData.address = motherData.address;
  }
  if (motherData.emergencyContactName !== undefined) {
    motherUpdateData.emergency_contact_name = motherData.emergencyContactName;
  }
  if (emergencyContact !== undefined) {
    motherUpdateData.emergency_contact_number = emergencyContact;
  }
  if (motherData.babyName !== undefined) {
    motherUpdateData.baby_name = motherData.babyName;
  }

  if (Object.keys(motherUpdateData).length > 0) {
    const { error: motherError } = await supabase
      .from("mother_profiles")
      .update(motherUpdateData)
      .eq("id", motherId);

    if (motherError) handleSupabaseError(motherError);
  }

  // Fetch and return updated profile
  const { data: mother, error: fetchError } = await supabase
    .from("mother_profiles")
    .select("*, profiles!user_id(full_name, contact_number, avatar_url)")
    .eq("id", motherId)
    .single();

  if (fetchError) handleSupabaseError(fetchError);

  const profile = mother.profiles as Record<string, unknown> | null;
  return {
    id: mother.id,
    userId: mother.user_id,
    birthdate: mother.birthdate ? new Date(mother.birthdate) : new Date(),
    contactNumber: (profile?.contact_number as string) || undefined,
    address: mother.address,
    emergencyContact: mother.emergency_contact_number,
    emergencyContactName: mother.emergency_contact_name,
    avatarUrl: profile?.avatar_url as string | undefined,
    babyName: mother.baby_name,
    fullName: (profile?.full_name as string) || "",
  };
}
