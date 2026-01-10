/**
 * Booklets API
 *
 * Supabase API endpoints for booklet operations.
 */

import { supabase, handleSupabaseError } from "./client";
import type {
  MotherBooklet,
  BookletAccess,
  BookletWithMother,
  DoctorProfile,
} from "../types";

// GET /booklets/:id
export async function getBookletById(
  id: string
): Promise<MotherBooklet | null> {
  const { data, error } = await supabase
    .from("booklets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    handleSupabaseError(error);
  }

  return data ? mapBooklet(data) : null;
}

// GET /booklets?motherId=:motherId
export async function getBookletsByMother(
  motherId: string
): Promise<MotherBooklet[]> {
  const { data, error } = await supabase
    .from("booklets")
    .select("*")
    .eq("mother_id", motherId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError(error);

  return (data || []).map(mapBooklet);
}

// GET /booklets/doctor/:doctorId
export async function getBookletsByDoctor(
  doctorId: string
): Promise<BookletWithMother[]> {
  // Get booklets with active access for this doctor
  // Join path: booklet_access -> booklets -> mother_profiles -> profiles
  const { data, error } = await supabase
    .from("booklet_access")
    .select(
      `
      booklet_id,
      booklets!inner (
        id,
        mother_id,
        label,
        status,
        created_at,
        expected_due_date,
        actual_delivery_date,
        notes,
        mother_profiles!mother_id (
          profiles!user_id (
            full_name
          )
        )
      )
    `
    )
    .eq("doctor_id", doctorId)
    .is("revoked_at", null);

  if (error) handleSupabaseError(error);

  if (!data || data.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookletIds = data.map((d: any) => d.booklets.id);

  // Get the latest medical entry for each booklet
  const { data: entriesData } = await supabase
    .from("medical_entries")
    .select("booklet_id, visit_date, follow_up_date")
    .in("booklet_id", bookletIds)
    .order("visit_date", { ascending: false });

  // Group entries by booklet
  const entriesByBooklet = new Map<
    string,
    { visitDate: string; followUpDate?: string }
  >();
  for (const entry of entriesData || []) {
    if (!entriesByBooklet.has(entry.booklet_id)) {
      entriesByBooklet.set(entry.booklet_id, {
        visitDate: entry.visit_date,
        followUpDate: entry.follow_up_date,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((d: any) => {
    const booklet = d.booklets;
    const motherProfile = booklet.mother_profiles;
    const profile = motherProfile?.profiles;
    const latestEntry = entriesByBooklet.get(booklet.id);

    return {
      id: booklet.id,
      motherId: booklet.mother_id,
      label: booklet.label,
      status: booklet.status as MotherBooklet["status"],
      createdAt: new Date(booklet.created_at),
      expectedDueDate: booklet.expected_due_date
        ? new Date(booklet.expected_due_date)
        : undefined,
      actualDeliveryDate: booklet.actual_delivery_date
        ? new Date(booklet.actual_delivery_date)
        : undefined,
      notes: booklet.notes,
      motherName: profile?.full_name || "Unknown",
      lastVisitDate: latestEntry?.visitDate
        ? new Date(latestEntry.visitDate)
        : undefined,
      nextAppointment: latestEntry?.followUpDate
        ? new Date(latestEntry.followUpDate)
        : undefined,
    };
  });
}

// POST /booklets
export async function createBooklet(
  bookletData: Omit<MotherBooklet, "id" | "createdAt">
): Promise<MotherBooklet> {
  const { data, error } = await supabase
    .from("booklets")
    .insert({
      mother_id: bookletData.motherId,
      label: bookletData.label,
      status: bookletData.status,
      expected_due_date: bookletData.expectedDueDate?.toISOString(),
      actual_delivery_date: bookletData.actualDeliveryDate?.toISOString(),
      notes: bookletData.notes,
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapBooklet(data);
}

// PUT /booklets/:id
export async function updateBooklet(
  id: string,
  updates: Partial<MotherBooklet>
): Promise<MotherBooklet> {
  const updateData: Record<string, unknown> = {};

  if (updates.label !== undefined) updateData.label = updates.label;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.expectedDueDate !== undefined)
    updateData.expected_due_date = updates.expectedDueDate?.toISOString();
  if (updates.actualDeliveryDate !== undefined)
    updateData.actual_delivery_date = updates.actualDeliveryDate?.toISOString();
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase
    .from("booklets")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapBooklet(data);
}

// POST /booklets/:bookletId/access
export async function grantDoctorAccess(
  bookletId: string,
  doctorId: string
): Promise<BookletAccess> {
  // Use RPC function to bypass RLS for FK validation
  // The function handles security checks internally
  const { data, error } = await supabase.rpc("grant_doctor_booklet_access", {
    p_booklet_id: bookletId,
    p_doctor_id: doctorId,
  });

  if (error) handleSupabaseError(error);

  return mapBookletAccess(data);
}

// DELETE /booklets/:bookletId/access/:doctorId
export async function revokeDoctorAccess(
  bookletId: string,
  doctorId: string
): Promise<void> {
  const { error } = await supabase
    .from("booklet_access")
    .update({ revoked_at: new Date().toISOString() })
    .eq("booklet_id", bookletId)
    .eq("doctor_id", doctorId)
    .is("revoked_at", null);

  if (error) handleSupabaseError(error);
}

// GET /booklets/:bookletId/doctors
export async function getBookletDoctors(
  bookletId: string
): Promise<DoctorProfile[]> {
  const { data, error } = await supabase
    .from("booklet_access")
    .select(
      `
      doctor_profiles!inner (
        id,
        user_id,
        prc_number,
        clinic_name,
        clinic_address,
        specialization,
        clinic_schedule,
        latitude,
        longitude,
        profiles!inner (
          full_name,
          contact_number,
          avatar_url
        )
      )
    `
    )
    .eq("booklet_id", bookletId)
    .is("revoked_at", null);

  if (error) handleSupabaseError(error);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((d: any) => {
    const dp = d.doctor_profiles;
    const profile = dp.profiles;

    return {
      id: dp.id,
      userId: dp.user_id,
      fullName: profile.full_name,
      prcNumber: dp.prc_number,
      clinicName: dp.clinic_name,
      clinicAddress: dp.clinic_address || "",
      contactNumber: profile.contact_number || "",
      specialization: dp.specialization,
      avatarUrl: profile.avatar_url,
      clinicSchedule: dp.clinic_schedule,
      latitude: dp.latitude,
      longitude: dp.longitude,
    };
  });
}

// Helper to map database row to MotherBooklet type
function mapBooklet(row: Record<string, unknown>): MotherBooklet {
  return {
    id: row.id as string,
    motherId: row.mother_id as string,
    label: row.label as string,
    status: row.status as MotherBooklet["status"],
    createdAt: new Date(row.created_at as string),
    expectedDueDate: row.expected_due_date
      ? new Date(row.expected_due_date as string)
      : undefined,
    actualDeliveryDate: row.actual_delivery_date
      ? new Date(row.actual_delivery_date as string)
      : undefined,
    notes: row.notes as string | undefined,
  };
}

// Helper to map database row to BookletAccess type
function mapBookletAccess(row: Record<string, unknown>): BookletAccess {
  return {
    id: row.id as string,
    bookletId: row.booklet_id as string,
    doctorId: row.doctor_id as string,
    grantedAt: new Date(row.granted_at as string),
    revokedAt: row.revoked_at ? new Date(row.revoked_at as string) : null,
  };
}
