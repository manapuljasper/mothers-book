/**
 * Doctors API
 *
 * Supabase operations for doctor profiles.
 */

import { supabase, handleSupabaseError, toCamelCase } from './client';
import type { DoctorProfile } from '../types';

/**
 * Get all doctor profiles
 */
export async function getAllDoctors(): Promise<DoctorProfile[]> {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) handleSupabaseError(error);

  return (data || []).map((d) => toCamelCase<DoctorProfile>(d));
}

/**
 * Get a doctor profile by ID
 */
export async function getDoctorById(id: string): Promise<DoctorProfile | null> {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    handleSupabaseError(error);
  }

  return data ? toCamelCase<DoctorProfile>(data) : null;
}

/**
 * Search doctors by name, clinic, or specialization
 */
export async function searchDoctors(query: string): Promise<DoctorProfile[]> {
  const searchTerm = `%${query}%`;

  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*')
    .or(`full_name.ilike.${searchTerm},clinic_name.ilike.${searchTerm},clinic_address.ilike.${searchTerm},specialization.ilike.${searchTerm}`)
    .order('full_name', { ascending: true });

  if (error) handleSupabaseError(error);

  return (data || []).map((d) => toCamelCase<DoctorProfile>(d));
}
