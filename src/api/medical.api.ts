/**
 * Medical API
 *
 * Supabase API endpoints for medical entries and lab requests.
 */

import { supabase, handleSupabaseError } from './client';
import type {
  MedicalEntry,
  MedicalEntryWithDoctor,
  LabRequest,
  LabStatus,
} from '../types';

// GET /entries?bookletId=:bookletId
export async function getEntriesByBooklet(bookletId: string): Promise<MedicalEntryWithDoctor[]> {
  const { data, error } = await supabase
    .from('medical_entries')
    .select(`
      *,
      doctor_profiles!inner (
        id,
        specialization,
        profiles!inner (
          full_name
        )
      )
    `)
    .eq('booklet_id', bookletId)
    .order('visit_date', { ascending: false });

  if (error) handleSupabaseError(error);

  return (data || []).map((row) => {
    const dp = row.doctor_profiles as {
      id: string;
      specialization?: string;
      profiles: { full_name: string };
    };

    return {
      ...mapMedicalEntry(row),
      doctorName: dp.profiles.full_name,
      doctorSpecialization: dp.specialization,
    };
  });
}

// GET /entries/:id
export async function getEntryById(id: string): Promise<MedicalEntry | null> {
  const { data, error } = await supabase
    .from('medical_entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error);
  }

  return data ? mapMedicalEntry(data) : null;
}

// POST /entries
export async function createEntry(
  entryData: Omit<MedicalEntry, 'id' | 'createdAt'>
): Promise<MedicalEntry> {
  const { data, error } = await supabase
    .from('medical_entries')
    .insert({
      booklet_id: entryData.bookletId,
      doctor_id: entryData.doctorId,
      entry_type: entryData.entryType,
      visit_date: entryData.visitDate.toISOString(),
      notes: entryData.notes,
      vitals: entryData.vitals,
      diagnosis: entryData.diagnosis,
      recommendations: entryData.recommendations,
      follow_up_date: entryData.followUpDate?.toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapMedicalEntry(data);
}

// PUT /entries/:id
export async function updateEntry(
  id: string,
  updates: Partial<MedicalEntry>
): Promise<MedicalEntry> {
  const updateData: Record<string, unknown> = {};

  if (updates.entryType !== undefined) updateData.entry_type = updates.entryType;
  if (updates.visitDate !== undefined) updateData.visit_date = updates.visitDate.toISOString();
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.vitals !== undefined) updateData.vitals = updates.vitals;
  if (updates.diagnosis !== undefined) updateData.diagnosis = updates.diagnosis;
  if (updates.recommendations !== undefined) updateData.recommendations = updates.recommendations;
  if (updates.followUpDate !== undefined) updateData.follow_up_date = updates.followUpDate?.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('medical_entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapMedicalEntry(data);
}

// GET /labs?bookletId=:bookletId
export async function getLabsByBooklet(bookletId: string): Promise<LabRequest[]> {
  // Direct query on booklet_id
  const { data, error } = await supabase
    .from('lab_requests')
    .select('*')
    .eq('booklet_id', bookletId)
    .order('requested_date', { ascending: false });

  if (error) handleSupabaseError(error);

  return (data || []).map(mapLabRequest);
}

// GET /labs?entryId=:entryId
export async function getLabsByEntry(entryId: string): Promise<LabRequest[]> {
  const { data, error } = await supabase
    .from('lab_requests')
    .select('*')
    .eq('medical_entry_id', entryId)
    .order('requested_date', { ascending: false });

  if (error) handleSupabaseError(error);

  return (data || []).map(mapLabRequest);
}

// GET /labs/pending?bookletId=:bookletId
export async function getPendingLabs(bookletId?: string): Promise<LabRequest[]> {
  let query = supabase
    .from('lab_requests')
    .select('*')
    .eq('status', 'pending')
    .order('requested_date', { ascending: false });

  if (bookletId) {
    query = query.eq('booklet_id', bookletId);
  }

  const { data, error } = await query;

  if (error) handleSupabaseError(error);

  return (data || []).map(mapLabRequest);
}

// POST /labs
export async function createLabRequest(
  labData: Omit<LabRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LabRequest> {
  const { data, error } = await supabase
    .from('lab_requests')
    .insert({
      booklet_id: labData.bookletId,
      medical_entry_id: labData.medicalEntryId || null,
      description: labData.description,
      status: labData.status,
      requested_date: labData.requestedDate.toISOString(),
      completed_date: labData.completedDate?.toISOString(),
      results: labData.results,
      notes: labData.notes,
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapLabRequest(data);
}

// PUT /labs/:id/status
export async function updateLabStatus(
  id: string,
  status: LabStatus,
  results?: string
): Promise<LabRequest> {
  const updateData: Record<string, unknown> = { status };

  if (results !== undefined) {
    updateData.results = results;
  }

  if (status === 'completed') {
    updateData.completed_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('lab_requests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapLabRequest(data);
}

// Helper to map database row to MedicalEntry type
function mapMedicalEntry(row: Record<string, unknown>): MedicalEntry {
  return {
    id: row.id as string,
    bookletId: row.booklet_id as string,
    doctorId: row.doctor_id as string,
    entryType: row.entry_type as MedicalEntry['entryType'],
    visitDate: new Date(row.visit_date as string),
    notes: row.notes as string,
    vitals: row.vitals as MedicalEntry['vitals'],
    diagnosis: row.diagnosis as string | undefined,
    recommendations: row.recommendations as string | undefined,
    followUpDate: row.follow_up_date ? new Date(row.follow_up_date as string) : undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
  };
}

// Helper to map database row to LabRequest type
function mapLabRequest(row: Record<string, unknown>): LabRequest {
  return {
    id: row.id as string,
    bookletId: row.booklet_id as string,
    medicalEntryId: row.medical_entry_id as string | undefined,
    description: row.description as string,
    status: row.status as LabStatus,
    requestedDate: new Date(row.requested_date as string),
    completedDate: row.completed_date ? new Date(row.completed_date as string) : undefined,
    results: row.results as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
  };
}
