-- database/seedDonors.sql
-- Inserts dummy donors directly into the users table (confirmed live structure:
-- id, name, email, phone, password_hash, blood_group, district, age, weight,
-- gender, is_available, last_donation_date, created_at — no separate donors table).
--
-- password_hash is required (NOT NULL). The value below is a bcrypt hash for the
-- plaintext password "Donor@123" — fine for test accounts.

INSERT INTO users (name, email, phone, password_hash, blood_group, district, age, weight, gender, is_available, last_donation_date)
VALUES
  ('Rafiq Islam',      'rafiq.islam.test@example.com',      '01711000001', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'O+',  'Khulna',    28, 68.5, 'Male',   true,  '2026-05-10'),
  ('Shirin Akter',     'shirin.akter.test@example.com',     '01711000002', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'A+',  'Khulna',    31, 58.0, 'Female', true,  '2026-06-01'),
  ('Kamal Hossain',    'kamal.hossain.test@example.com',    '01711000003', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'B+',  'Jessore',   26, 72.0, 'Male',   true,  '2026-04-20'),
  ('Nasrin Sultana',   'nasrin.sultana.test@example.com',   '01711000004', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'AB+', 'Khulna',    34, 60.5, 'Female', true,  '2026-03-15'),
  ('Jahangir Alam',    'jahangir.alam.test@example.com',    '01711000005', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'O-',  'Bagerhat',  29, 70.0, 'Male',   true,  '2026-06-10'),
  ('Ruma Begum',       'ruma.begum.test@example.com',       '01711000006', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'A-',  'Khulna',    24, 55.0, 'Female', true,  '2026-01-05'),
  ('Shafiqul Islam',   'shafiqul.islam.test@example.com',   '01711000007', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'B-',  'Satkhira',  37, 75.0, 'Male',   true,  '2026-05-25'),
  ('Farida Yasmin',    'farida.yasmin.test@example.com',    '01711000008', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'AB-', 'Khulna',    22, 52.0, 'Female', true,  '2026-02-18'),
  ('Mizanur Rahman',   'mizanur.rahman.test@example.com',   '01711000009', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'O+',  'Jessore',   40, 80.0, 'Male',   true,  '2026-06-05'),
  ('Taslima Khatun',   'taslima.khatun.test@example.com',   '01711000010', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'A+',  'Bagerhat',  27, 57.5, 'Female', true,  '2026-04-30'),
  ('Habibur Rahman',   'habibur.rahman.test@example.com',   '01711000011', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'O+',  'Khulna',    33, 69.0, 'Male',   false, '2025-11-12'),
  ('Sabina Yasmin',    'sabina.yasmin.test@example.com',    '01711000012', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6bH5vB2mZ9J8m4qE1Y6qk2rGZQmO', 'B+',  'Khulna',    25, 54.0, 'Female', true,  '2026-06-12')
ON CONFLICT (email) DO NOTHING;