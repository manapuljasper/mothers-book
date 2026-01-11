-- Migration: Link medications and lab_requests directly to booklets
-- This simplifies the data model by allowing medications and labs to be
-- associated with a booklet without requiring a medical entry.

-- Add booklet_id column to medications
ALTER TABLE medications ADD COLUMN booklet_id UUID REFERENCES booklets(id) ON DELETE CASCADE;

-- Add booklet_id column to lab_requests
ALTER TABLE lab_requests ADD COLUMN booklet_id UUID REFERENCES booklets(id) ON DELETE CASCADE;

-- Backfill existing data: Get booklet_id from the related medical_entries
UPDATE medications m
SET booklet_id = (SELECT booklet_id FROM medical_entries WHERE id = m.medical_entry_id)
WHERE m.booklet_id IS NULL AND m.medical_entry_id IS NOT NULL;

UPDATE lab_requests l
SET booklet_id = (SELECT booklet_id FROM medical_entries WHERE id = l.medical_entry_id)
WHERE l.booklet_id IS NULL AND l.medical_entry_id IS NOT NULL;

-- Make booklet_id required (NOT NULL)
ALTER TABLE medications ALTER COLUMN booklet_id SET NOT NULL;
ALTER TABLE lab_requests ALTER COLUMN booklet_id SET NOT NULL;

-- Make medical_entry_id optional (for historical tracking only)
ALTER TABLE medications ALTER COLUMN medical_entry_id DROP NOT NULL;
ALTER TABLE lab_requests ALTER COLUMN medical_entry_id DROP NOT NULL;

-- Add indexes for efficient querying by booklet
CREATE INDEX IF NOT EXISTS idx_medications_booklet_id ON medications(booklet_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_booklet_id ON lab_requests(booklet_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_medications_booklet_active ON medications(booklet_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lab_requests_booklet_status ON lab_requests(booklet_id, status);
