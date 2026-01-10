# Supabase Integration Plan

## Overview
Integrate Supabase into the app - client setup, data layer, and seed data. Auth will be done separately.

## Schema Differences to Address
The sample data has some fields not in the Supabase schema:
- `MotherProfile.babyName` - **Add to schema** (useful field)
- `Medication.bookletId`, `createdByDoctorId` - **Remove from types** (derivable via joins)
- `LabRequest.bookletId` - **Remove from types** (derivable)
- `MedicationIntakeLog.bookletId`, `medicalEntryId` - **Remove from types** (derivable)

## Files to Create/Modify

### 1. Environment Setup
- **Create** `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Update** `.gitignore` to add `.env`

### 2. Supabase Client
- **Create** `src/lib/supabase.ts` - Client with MMKV storage adapter
- **Create** `src/lib/database.types.ts` - Generated types from Supabase (optional, can add later)

### 3. Seed File
- **Create** `supabase/seed.sql` - Seed data for development
  - Insert test users into `auth.users` (with known passwords)
  - Insert profiles, doctor_profiles, mother_profiles
  - Insert booklets, booklet_access
  - Insert medical_entries, lab_requests
  - Insert medications, medication_intake_logs

### 4. Update API Layer
Replace MMKV-based APIs with Supabase queries:
- **Modify** `src/api/booklets.api.ts` - Use supabase client
- **Modify** `src/api/medical.api.ts` - Use supabase client
- **Modify** `src/api/medications.api.ts` - Use supabase client

### 5. Update Types
- **Modify** `src/types/user.types.ts` - Align with Supabase schema
- **Modify** `src/types/medication.types.ts` - Remove redundant FKs

### 6. Migration for babyName
- **Create** `supabase/migrations/00007_add_baby_name.sql`

## Seed Data Strategy
Manual user creation approach:
1. Create test users via signup flow (one-time setup)
2. Note their UUIDs from Supabase dashboard
3. Seed all other tables (profiles, booklets, etc.) via SQL referencing those UUIDs

For local dev with `supabase db reset`, the seed.sql can insert into auth.users directly since it runs with elevated permissions.

## Implementation Order
1. Add `babyName` migration
2. Create `.env` and Supabase client
3. Update types to match schema
4. Update API layer to use Supabase
5. Create seed.sql for non-auth tables
6. Test queries work with RLS

## Files to Delete After Confirmation
- `src/data/` (entire folder)
- `src/stores/booklet.store.ts` (if fully replaced by React Query + Supabase)
- `src/stores/medical.store.ts` (if fully replaced)
- `src/stores/medication.store.ts` (if fully replaced)

## Verification
1. Run seed: `npx supabase db reset --linked`
2. Check data appears in Supabase dashboard
3. Test API calls return correct data
4. Verify RLS blocks unauthorized access
