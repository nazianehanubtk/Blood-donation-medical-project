-- add_user_type_and_ensure_last_donation.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NOT NULL DEFAULT 'patient'
  CHECK (user_type IN ('donor', 'patient', 'hospital'));

-- last_donation_date already exists in schema; nothing to add there.
-- This migration only adds the role column so frontend can distinguish donor/patient/hospital.