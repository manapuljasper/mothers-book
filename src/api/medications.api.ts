/**
 * Medications API
 *
 * Supabase API endpoints for medication operations.
 */

import { supabase, handleSupabaseError } from './client';
import { getStartOfDay, isToday } from '../utils/date.utils';
import type {
  Medication,
  MedicationIntakeLog,
  MedicationWithLogs,
  IntakeStatus,
} from '../types';

// Helper function to calculate adherence rate
function calculateAdherence(
  medication: Medication,
  logs: MedicationIntakeLog[],
  days: number = 7
): number {
  const today = getStartOfDay();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const medStartDate = new Date(medication.startDate);
  const effectiveStartDate = medStartDate > startDate ? medStartDate : startDate;

  const daysDiff = Math.ceil(
    (today.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff <= 0) return 100;

  const expectedDoses = daysDiff * medication.frequencyPerDay;

  const takenDoses = logs.filter((l) => {
    const logDate = new Date(l.scheduledDate);
    return l.status === 'taken' && logDate >= effectiveStartDate && logDate <= today;
  }).length;

  return Math.round((takenDoses / expectedDoses) * 100);
}

// Helper to enrich medication with logs
function enrichMedicationWithLogs(
  medication: Medication,
  allLogs: MedicationIntakeLog[]
): MedicationWithLogs {
  const logs = allLogs.filter((l) => l.medicationId === medication.id);
  const todayLogs = logs.filter((l) => isToday(new Date(l.scheduledDate)));

  return {
    ...medication,
    intakeLogs: logs,
    todayLogs,
    adherenceRate: calculateAdherence(medication, logs),
  };
}

// GET /medications?bookletId=:bookletId
export async function getMedicationsByBooklet(bookletId: string): Promise<MedicationWithLogs[]> {
  // Direct query on booklet_id
  const { data: medications, error } = await supabase
    .from('medications')
    .select('*')
    .eq('booklet_id', bookletId)
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);

  if (!medications || medications.length === 0) return [];

  // Get intake logs for these medications
  const medIds = medications.map((m) => m.id);
  const { data: logs } = await supabase
    .from('medication_intake_logs')
    .select('*')
    .in('medication_id', medIds);

  const mappedMeds = medications.map(mapMedication);
  const mappedLogs = (logs || []).map(mapIntakeLog);

  return mappedMeds.map((m) => enrichMedicationWithLogs(m, mappedLogs));
}

// GET /medications/active?bookletId=:bookletId
export async function getActiveMedications(bookletId?: string): Promise<MedicationWithLogs[]> {
  let query = supabase
    .from('medications')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (bookletId) {
    query = query.eq('booklet_id', bookletId);
  }

  const { data: medications, error } = await query;

  if (error) handleSupabaseError(error);

  if (!medications || medications.length === 0) return [];

  // Get intake logs for these medications
  const medIds = medications.map((m) => m.id);
  const { data: logs } = await supabase
    .from('medication_intake_logs')
    .select('*')
    .in('medication_id', medIds);

  const mappedMeds = medications.map(mapMedication);
  const mappedLogs = (logs || []).map(mapIntakeLog);

  return mappedMeds.map((m) => enrichMedicationWithLogs(m, mappedLogs));
}

// GET /medications/today?bookletId=:bookletId
export async function getTodayMedications(bookletId?: string): Promise<MedicationWithLogs[]> {
  return getActiveMedications(bookletId);
}

// GET /medications/:id
export async function getMedicationById(id: string): Promise<Medication | null> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error);
  }

  return data ? mapMedication(data) : null;
}

// GET /medications?entryId=:entryId
export async function getMedicationsByEntry(entryId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('medical_entry_id', entryId);

  if (error) handleSupabaseError(error);

  return (data || []).map(mapMedication);
}

// POST /medications
export async function createMedication(
  medData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .insert({
      booklet_id: medData.bookletId,
      medical_entry_id: medData.medicalEntryId || null,
      name: medData.name,
      dosage: medData.dosage,
      instructions: medData.instructions,
      frequency_per_day: medData.frequencyPerDay,
      times_of_day: medData.timesOfDay,
      start_date: medData.startDate.toISOString().split('T')[0],
      end_date: medData.endDate?.toISOString().split('T')[0],
      is_active: medData.isActive,
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapMedication(data);
}

// PUT /medications/:id
export async function updateMedication(
  id: string,
  updates: Partial<Medication>
): Promise<Medication> {
  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.dosage !== undefined) updateData.dosage = updates.dosage;
  if (updates.instructions !== undefined) updateData.instructions = updates.instructions;
  if (updates.frequencyPerDay !== undefined) updateData.frequency_per_day = updates.frequencyPerDay;
  if (updates.timesOfDay !== undefined) updateData.times_of_day = updates.timesOfDay;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString().split('T')[0];
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate?.toISOString().split('T')[0];
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('medications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapMedication(data);
}

// PUT /medications/:id/deactivate
export async function deactivateMedication(id: string): Promise<Medication> {
  return updateMedication(id, { isActive: false });
}

// POST /medications/:medicationId/intake
export async function logIntake(
  medicationId: string,
  doseIndex: number,
  status: IntakeStatus,
  userId: string,
  date: Date = new Date()
): Promise<MedicationIntakeLog> {
  const scheduledDate = getStartOfDay(date).toISOString().split('T')[0];

  // Check if log already exists for this dose on this day
  const { data: existing } = await supabase
    .from('medication_intake_logs')
    .select('*')
    .eq('medication_id', medicationId)
    .eq('scheduled_date', scheduledDate)
    .eq('dose_index', doseIndex)
    .single();

  if (existing) {
    // Update existing log
    const { data, error } = await supabase
      .from('medication_intake_logs')
      .update({
        status,
        taken_at: status === 'taken' ? new Date().toISOString() : null,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    return mapIntakeLog(data);
  }

  // Create new log
  const { data, error } = await supabase
    .from('medication_intake_logs')
    .insert({
      medication_id: medicationId,
      scheduled_date: scheduledDate,
      dose_index: doseIndex,
      status,
      taken_at: status === 'taken' ? new Date().toISOString() : null,
      recorded_by_user_id: userId,
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapIntakeLog(data);
}

// GET /medications/:medicationId/adherence?days=:days
export async function getMedicationAdherence(
  medicationId: string,
  days: number = 7
): Promise<number> {
  const { data: medication, error: medError } = await supabase
    .from('medications')
    .select('*')
    .eq('id', medicationId)
    .single();

  if (medError) {
    if (medError.code === 'PGRST116') return 0;
    handleSupabaseError(medError);
  }

  const { data: logs } = await supabase
    .from('medication_intake_logs')
    .select('*')
    .eq('medication_id', medicationId);

  const mappedMed = mapMedication(medication);
  const mappedLogs = (logs || []).map(mapIntakeLog);

  return calculateAdherence(mappedMed, mappedLogs, days);
}

// Helper to map database row to Medication type
function mapMedication(row: Record<string, unknown>): Medication {
  return {
    id: row.id as string,
    bookletId: row.booklet_id as string,
    medicalEntryId: row.medical_entry_id as string | undefined,
    name: row.name as string,
    dosage: row.dosage as string,
    instructions: row.instructions as string | undefined,
    startDate: new Date(row.start_date as string),
    endDate: row.end_date ? new Date(row.end_date as string) : undefined,
    frequencyPerDay: row.frequency_per_day as Medication['frequencyPerDay'],
    timesOfDay: row.times_of_day as string[] | undefined,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
  };
}

// Helper to map database row to MedicationIntakeLog type
function mapIntakeLog(row: Record<string, unknown>): MedicationIntakeLog {
  return {
    id: row.id as string,
    medicationId: row.medication_id as string,
    scheduledDate: new Date(row.scheduled_date as string),
    doseIndex: row.dose_index as number,
    status: row.status as IntakeStatus,
    takenAt: row.taken_at ? new Date(row.taken_at as string) : undefined,
    recordedByUserId: row.recorded_by_user_id as string,
    notes: row.notes as string | undefined,
    createdAt: new Date(row.created_at as string),
  };
}
