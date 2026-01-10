/**
 * Doctors API
 *
 * Supabase operations for doctor profiles.
 */

import { supabase, handleSupabaseError } from "./client";
import type { DoctorProfile } from "../types";

function mapDoctor(d: Record<string, unknown>): DoctorProfile {
  const profile = d.profiles as Record<string, unknown> | null;
  return {
    id: d.id as string,
    userId: d.user_id as string,
    prcNumber: d.prc_number as string,
    clinicName: d.clinic_name as string,
    clinicAddress: (d.clinic_address as string) || "",
    contactNumber: (profile?.contact_number as string) || "",
    specialization: d.specialization as string | undefined,
    avatarUrl: profile?.avatar_url as string | undefined,
    clinicSchedule: d.clinic_schedule as string | undefined,
    latitude: d.latitude as number | undefined,
    longitude: d.longitude as number | undefined,
    fullName: (profile?.full_name as string) || "",
  };
}

/**
 * Get all doctor profiles
 */
export async function getAllDoctors(): Promise<DoctorProfile[]> {
  const { data, error } = await supabase
    .from("doctor_profiles")
    .select("*, profiles!inner(full_name, contact_number, avatar_url)")
    .order("user_id", { ascending: true });

  if (error) handleSupabaseError(error);

  return (data || []).map(mapDoctor);
}

/**
 * Get a doctor profile by ID
 */
export async function getDoctorById(id: string): Promise<DoctorProfile | null> {
  const { data, error } = await supabase
    .from("doctor_profiles")
    .select("*, profiles!inner(full_name, contact_number, avatar_url)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    handleSupabaseError(error);
  }

  return data ? mapDoctor(data) : null;
}

/**
 * Search doctors by name, clinic, or specialization
 */
export async function searchDoctors(query: string): Promise<DoctorProfile[]> {
  const searchTerm = `%${query}%`;

  const { data, error } = await supabase
    .from("doctor_profiles")
    .select("*, profiles!inner(full_name, contact_number, avatar_url)")
    .or(
      `clinic_name.ilike.${searchTerm},clinic_address.ilike.${searchTerm},specialization.ilike.${searchTerm},profiles.full_name.ilike.${searchTerm}`
    )
    .order("clinic_name", { ascending: true });

  if (error) handleSupabaseError(error);

  return (data || []).map(mapDoctor);
}
