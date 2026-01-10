-- Seed data for Mother's Book
-- This file is run when you execute `npx supabase db reset --linked`
--
-- IMPORTANT: Test user credentials
-- All test users use the password: Test123!
--
-- Doctors:
--   dr.santos@clinic.ph
--   dr.reyes@hospital.ph
--   dr.villanueva@medcenter.ph
--
-- Mothers:
--   maria.cruz@gmail.com
--   anna.garcia@gmail.com
--   sofia.mendoza@gmail.com

-- Insert test users into auth.users
-- Password hash is for 'Test123!' using bcrypt
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES
  -- Doctors
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '00000000-0000-0000-0000-000000000000',
    'dr.santos@clinic.ph',
    '$2a$10$PwZ5OQVTpJ2YrN8CvQXZXe5p1Py9QXBZB8f9pN8S3QJyVJ3BQfNFi',
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "doctor", "full_name": "Dr. Maria Elena Santos"}',
    '2024-01-15T08:00:00Z',
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    '00000000-0000-0000-0000-000000000000',
    'dr.reyes@hospital.ph',
    '$2a$10$PwZ5OQVTpJ2YrN8CvQXZXe5p1Py9QXBZB8f9pN8S3QJyVJ3BQfNFi',
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "doctor", "full_name": "Dr. Jose Antonio Reyes"}',
    '2024-02-20T08:00:00Z',
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    '00000000-0000-0000-0000-000000000000',
    'dr.villanueva@medcenter.ph',
    '$2a$10$PwZ5OQVTpJ2YrN8CvQXZXe5p1Py9QXBZB8f9pN8S3QJyVJ3BQfNFi',
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "doctor", "full_name": "Dr. Ana Patricia Villanueva"}',
    '2024-03-01T08:00:00Z',
    now(),
    'authenticated',
    'authenticated'
  ),
  -- Mothers
  (
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    '00000000-0000-0000-0000-000000000000',
    'maria.cruz@gmail.com',
    '$2a$10$PwZ5OQVTpJ2YrN8CvQXZXe5p1Py9QXBZB8f9pN8S3QJyVJ3BQfNFi',
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "mother", "full_name": "Maria Isabel Cruz"}',
    '2024-03-01T08:00:00Z',
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    '00000000-0000-0000-0000-000000000000',
    'anna.garcia@gmail.com',
    '$2a$10$PwZ5OQVTpJ2YrN8CvQXZXe5p1Py9QXBZB8f9pN8S3QJyVJ3BQfNFi',
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "mother", "full_name": "Anna Patricia Garcia"}',
    '2024-03-15T08:00:00Z',
    now(),
    'authenticated',
    'authenticated'
  ),
  (
    'f6a7b8c9-d0e1-2345-fabc-456789012345',
    '00000000-0000-0000-0000-000000000000',
    'sofia.mendoza@gmail.com',
    '$2a$10$PwZ5OQVTpJ2YrN8CvQXZXe5p1Py9QXBZB8f9pN8S3QJyVJ3BQfNFi',
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "mother", "full_name": "Sofia Beatriz Mendoza"}',
    '2024-04-01T08:00:00Z',
    now(),
    'authenticated',
    'authenticated'
  );

-- Insert identities for the users (required for Supabase auth)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '{"sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "email": "dr.santos@clinic.ph"}', 'email', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', now(), now(), now()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '{"sub": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "email": "dr.reyes@hospital.ph"}', 'email', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', now(), now(), now()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '{"sub": "c3d4e5f6-a7b8-9012-cdef-123456789012", "email": "dr.villanueva@medcenter.ph"}', 'email', 'c3d4e5f6-a7b8-9012-cdef-123456789012', now(), now(), now()),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'd4e5f6a7-b8c9-0123-defa-234567890123', '{"sub": "d4e5f6a7-b8c9-0123-defa-234567890123", "email": "maria.cruz@gmail.com"}', 'email', 'd4e5f6a7-b8c9-0123-defa-234567890123', now(), now(), now()),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'e5f6a7b8-c9d0-1234-efab-345678901234', '{"sub": "e5f6a7b8-c9d0-1234-efab-345678901234", "email": "anna.garcia@gmail.com"}', 'email', 'e5f6a7b8-c9d0-1234-efab-345678901234', now(), now(), now()),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'f6a7b8c9-d0e1-2345-fabc-456789012345', '{"sub": "f6a7b8c9-d0e1-2345-fabc-456789012345", "email": "sofia.mendoza@gmail.com"}', 'email', 'f6a7b8c9-d0e1-2345-fabc-456789012345', now(), now(), now());

-- The auth trigger automatically creates profiles when users are inserted.
-- We need to delete those auto-created ones to insert our detailed versions.
DELETE FROM doctor_profiles;
DELETE FROM mother_profiles;
DELETE FROM profiles;

-- Profiles (base profile for all users)
INSERT INTO profiles (id, role, full_name, contact_number, created_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'doctor', 'Dr. Maria Elena Santos', '+63 917 123 4567', '2024-01-15T08:00:00Z'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'doctor', 'Dr. Jose Antonio Reyes', '+63 918 234 5678', '2024-02-20T08:00:00Z'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'doctor', 'Dr. Ana Patricia Villanueva', '+63 919 345 6789', '2024-03-01T08:00:00Z'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'mother', 'Maria Isabel Cruz', '+63 920 456 7890', '2024-03-01T08:00:00Z'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'mother', 'Anna Patricia Garcia', '+63 922 678 9012', '2024-03-15T08:00:00Z'),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'mother', 'Sofia Beatriz Mendoza', '+63 924 890 1234', '2024-04-01T08:00:00Z');

-- Doctor profiles
INSERT INTO doctor_profiles (id, user_id, prc_number, clinic_name, clinic_address, specialization, clinic_schedule, latitude, longitude) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRC-0123456', 'Santos OB-GYN Clinic', '123 Rizal Avenue, Makati City, Metro Manila', 'OB-GYN', 'Mon-Fri: 9AM-5PM, Sat: 9AM-12PM', 14.5547, 121.0244),
  ('22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'PRC-0234567', 'Manila General Hospital - OB Department', '456 Taft Avenue, Manila', 'Maternal-Fetal Medicine', 'Mon-Wed-Fri: 8AM-4PM', 14.5795, 120.9842),
  ('33333333-3333-3333-3333-333333333333', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'PRC-0345678', 'Pasig Medical Center', '789 Shaw Boulevard, Pasig City, Metro Manila', 'OB-GYN', 'Tue-Thu-Sat: 10AM-6PM', 14.5764, 121.0851);

-- Mother profiles
INSERT INTO mother_profiles (id, user_id, birthdate, address, emergency_contact_name, emergency_contact_number, baby_name) VALUES
  ('44444444-4444-4444-4444-444444444444', 'd4e5f6a7-b8c9-0123-defa-234567890123', '1992-05-15', '789 Mabini Street, Pasig City, Metro Manila', 'Juan Cruz (Husband)', '+63 921 567 8901', 'Sofia'),
  ('55555555-5555-5555-5555-555555555555', 'e5f6a7b8-c9d0-1234-efab-345678901234', '1988-11-22', '321 Bonifacio Avenue, Taguig City, Metro Manila', 'Miguel Garcia (Husband)', '+63 923 789 0123', NULL),
  ('66666666-6666-6666-6666-666666666666', 'f6a7b8c9-d0e1-2345-fabc-456789012345', '1995-03-08', '456 Ayala Avenue, Makati City, Metro Manila', 'Carlos Mendoza (Husband)', '+63 925 901 2345', NULL);

-- Booklets
INSERT INTO booklets (id, mother_id, label, status, expected_due_date, actual_delivery_date, notes, created_at) VALUES
  ('aaaa1111-aaaa-1111-aaaa-111111111111', '44444444-4444-4444-4444-444444444444', 'Pregnancy 2024 - Baby Sofia', 'active', '2024-11-15', NULL, 'First pregnancy, high-risk due to gestational diabetes history in family', '2024-03-01T08:00:00Z'),
  ('aaaa2222-aaaa-2222-aaaa-222222222222', '44444444-4444-4444-4444-444444444444', 'Pregnancy 2022 - Juan Miguel', 'completed', NULL, '2022-09-05', 'Normal vaginal delivery, 3.2kg baby boy', '2022-01-10T08:00:00Z'),
  ('bbbb1111-bbbb-1111-bbbb-111111111111', '55555555-5555-5555-5555-555555555555', 'Pregnancy 2024', 'active', '2024-12-20', NULL, 'Second pregnancy, first child born via C-section', '2024-04-20T08:00:00Z'),
  ('cccc1111-cccc-1111-cccc-111111111111', '66666666-6666-6666-6666-666666666666', 'Pregnancy 2024 - First Baby', 'active', '2025-01-10', NULL, 'First pregnancy, primigravida', '2024-05-01T08:00:00Z');

-- Booklet access
INSERT INTO booklet_access (id, booklet_id, doctor_id, granted_at, revoked_at) VALUES
  ('acc11111-acc1-1111-acc1-111111111111', 'aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', '2024-03-02T10:00:00Z', NULL),
  ('acc22222-acc2-2222-acc2-222222222222', 'aaaa1111-aaaa-1111-aaaa-111111111111', '22222222-2222-2222-2222-222222222222', '2024-05-15T14:00:00Z', NULL),
  ('acc33333-acc3-3333-acc3-333333333333', 'aaaa2222-aaaa-2222-aaaa-222222222222', '11111111-1111-1111-1111-111111111111', '2022-01-15T09:00:00Z', NULL),
  ('acc44444-acc4-4444-acc4-444444444444', 'bbbb1111-bbbb-1111-bbbb-111111111111', '11111111-1111-1111-1111-111111111111', '2024-04-21T11:00:00Z', NULL),
  ('acc55555-acc5-5555-acc5-555555555555', 'bbbb1111-bbbb-1111-bbbb-111111111111', '33333333-3333-3333-3333-333333333333', '2024-06-01T15:00:00Z', NULL),
  ('acc66666-acc6-6666-acc6-666666666666', 'cccc1111-cccc-1111-cccc-111111111111', '33333333-3333-3333-3333-333333333333', '2024-05-02T09:30:00Z', NULL);

-- Medical entries
INSERT INTO medical_entries (id, booklet_id, doctor_id, entry_type, visit_date, notes, vitals, diagnosis, recommendations, follow_up_date, created_at) VALUES
  ('e0001001-0001-0001-0001-000000000001', 'aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'prenatal_checkup', '2024-03-15T10:00:00Z', 'Initial prenatal consultation. Patient is 8 weeks pregnant based on LMP. Advised on diet and lifestyle modifications.', '{"bloodPressure": "110/70", "weight": 58, "heartRate": 76}', 'Normal intrauterine pregnancy, 8 weeks AOG', 'Start prenatal vitamins, avoid raw foods, increase water intake. Schedule next visit in 4 weeks.', '2024-04-12', '2024-03-15T10:30:00Z'),
  ('e0002002-0002-0002-0002-000000000002', 'aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'prenatal_checkup', '2024-04-12T10:00:00Z', 'Second prenatal visit. Patient reports mild morning sickness, manageable with dietary changes. Fetal heartbeat detected via doppler.', '{"bloodPressure": "115/75", "weight": 59.5, "heartRate": 78, "fetalHeartRate": 158}', 'Normal pregnancy progression, 12 weeks AOG', 'Continue prenatal vitamins. First trimester screening scheduled. Consider genetic counseling if desired.', '2024-05-10', '2024-04-12T10:45:00Z'),
  ('e0003003-0003-0003-0003-000000000003', 'aaaa1111-aaaa-1111-aaaa-111111111111', '22222222-2222-2222-2222-222222222222', 'ultrasound', '2024-05-20T14:00:00Z', 'Anomaly scan performed. All fetal structures visualized and within normal limits. Placenta anterior, grade 0. AFI adequate.', '{"fetalHeartRate": 145}', 'Normal fetal anatomy, 20 weeks AOG. Female fetus.', 'Continue current medications. Next ultrasound at 32 weeks for growth assessment.', '2024-07-15', '2024-05-20T15:00:00Z'),
  ('e0004004-0004-0004-0004-000000000004', 'aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'prenatal_checkup', '2024-06-14T10:00:00Z', 'Routine prenatal checkup. Patient reports feeling fetal movements. No unusual symptoms or complaints.', '{"bloodPressure": "118/76", "weight": 62, "heartRate": 80, "fetalHeartRate": 148, "fundalHeight": 24, "aog": "24 weeks 2 days"}', 'Normal pregnancy, 24 weeks AOG', 'Continue current regimen. Start calcium supplementation. Monitor for signs of preterm labor.', '2024-07-12', '2024-06-14T10:30:00Z'),
  ('e0005005-0005-0005-0005-000000000005', 'bbbb1111-bbbb-1111-bbbb-111111111111', '11111111-1111-1111-1111-111111111111', 'prenatal_checkup', '2024-04-25T11:00:00Z', 'Initial prenatal visit. G2P1 (1001). Previous C-section in 2021 due to breech presentation. 10 weeks AOG by LMP.', '{"bloodPressure": "120/80", "weight": 65, "heartRate": 72}', 'Intrauterine pregnancy, 10 weeks AOG. Previous cesarean delivery.', 'Prenatal vitamins started. VBAC counseling scheduled. Close monitoring recommended.', '2024-05-23', '2024-04-25T11:30:00Z'),
  ('e0006006-0006-0006-0006-000000000006', 'bbbb1111-bbbb-1111-bbbb-111111111111', '33333333-3333-3333-3333-333333333333', 'ultrasound', '2024-06-15T15:00:00Z', 'Dating scan and NT measurement. Single live intrauterine pregnancy. NT within normal limits.', '{"fetalHeartRate": 162}', 'Normal pregnancy, 18 weeks AOG. Low risk for chromosomal abnormalities.', 'Anatomy scan scheduled at 20-22 weeks. Continue prenatal care.', '2024-07-13', '2024-06-15T15:45:00Z'),
  ('e0007007-0007-0007-0007-000000000007', 'cccc1111-cccc-1111-cccc-111111111111', '33333333-3333-3333-3333-333333333333', 'prenatal_checkup', '2024-05-10T09:00:00Z', 'Initial prenatal consultation. Primigravida, no significant medical history. Excited about first pregnancy.', '{"bloodPressure": "108/68", "weight": 55, "heartRate": 70}', 'Early intrauterine pregnancy, approximately 6 weeks AOG', 'Folic acid supplementation. Avoid alcohol and smoking. Return in 2 weeks for viability scan.', '2024-05-24', '2024-05-10T09:30:00Z'),
  ('e0008008-0008-0008-0008-000000000008', 'cccc1111-cccc-1111-cccc-111111111111', '33333333-3333-3333-3333-333333333333', 'ultrasound', '2024-05-24T09:00:00Z', 'Viability scan. Single gestational sac with yolk sac and fetal pole visualized. Cardiac activity present.', '{"fetalHeartRate": 120}', 'Viable intrauterine pregnancy, 8 weeks 2 days AOG', 'Continue folic acid. Start prenatal vitamins. Schedule NT scan at 11-13 weeks.', '2024-06-21', '2024-05-24T09:45:00Z');

-- Lab requests
INSERT INTO lab_requests (id, medical_entry_id, description, status, requested_date, completed_date, results, notes, created_at) VALUES
  ('1ab00001-0001-0001-0001-000000000001', 'e0001001-0001-0001-0001-000000000001', 'Complete Blood Count (CBC)', 'completed', '2024-03-15T00:00:00Z', '2024-03-16T00:00:00Z', 'Hgb: 12.5 g/dL, Hct: 37%, WBC: 8,500, Platelets: 250,000. All within normal limits.', NULL, now()),
  ('1ab00002-0002-0002-0002-000000000002', 'e0001001-0001-0001-0001-000000000001', 'Blood Typing (ABO-Rh)', 'completed', '2024-03-15T00:00:00Z', '2024-03-16T00:00:00Z', 'Blood Type: O Positive', NULL, now()),
  ('1ab00003-0003-0003-0003-000000000003', 'e0001001-0001-0001-0001-000000000001', 'Urinalysis', 'completed', '2024-03-15T00:00:00Z', '2024-03-16T00:00:00Z', 'No abnormalities detected. No UTI.', NULL, now()),
  ('1ab00004-0004-0004-0004-000000000004', 'e0001001-0001-0001-0001-000000000001', 'Hepatitis B Surface Antigen (HBsAg)', 'completed', '2024-03-15T00:00:00Z', '2024-03-17T00:00:00Z', 'Non-reactive', NULL, now()),
  ('1ab00005-0005-0005-0005-000000000005', 'e0004004-0004-0004-0004-000000000004', 'Glucose Challenge Test (GCT)', 'pending', '2024-06-14T00:00:00Z', NULL, NULL, 'To be done at 24-28 weeks. Family history of gestational diabetes.', now()),
  ('1ab00006-0006-0006-0006-000000000006', 'e0005005-0005-0005-0005-000000000005', 'Complete Blood Count (CBC)', 'completed', '2024-04-25T00:00:00Z', '2024-04-26T00:00:00Z', 'Hgb: 11.8 g/dL, Hct: 35%, WBC: 7,800, Platelets: 280,000. Mild anemia noted.', NULL, now()),
  ('1ab00007-0007-0007-0007-000000000007', 'e0005005-0005-0005-0005-000000000005', 'Urinalysis', 'completed', '2024-04-25T00:00:00Z', '2024-04-26T00:00:00Z', 'Normal findings.', NULL, now()),
  ('1ab00008-0008-0008-0008-000000000008', 'e0007007-0007-0007-0007-000000000007', 'Complete Blood Count (CBC)', 'completed', '2024-05-10T00:00:00Z', '2024-05-11T00:00:00Z', 'Hgb: 13.2 g/dL, Hct: 39%, WBC: 6,900, Platelets: 310,000. All normal.', NULL, now()),
  ('1ab00009-0009-0009-0009-000000000009', 'e0007007-0007-0007-0007-000000000007', 'Thyroid Function Tests (TSH, FT4)', 'pending', '2024-05-10T00:00:00Z', NULL, NULL, 'Routine thyroid screening for first pregnancy.', now());

-- Medications
INSERT INTO medications (id, medical_entry_id, name, dosage, instructions, start_date, end_date, frequency_per_day, times_of_day, is_active, created_at) VALUES
  ('aed00001-0001-0001-0001-000000000001', 'e0001001-0001-0001-0001-000000000001', 'Ferrous Sulfate', '325mg', 'Take 1 tablet daily with meals. Avoid taking with calcium or antacids. May cause dark stools.', '2024-03-15', '2024-11-15', 1, ARRAY['08:00'], true, '2024-03-15T10:30:00Z'),
  ('aed00002-0002-0002-0002-000000000002', 'e0001001-0001-0001-0001-000000000001', 'Folic Acid', '400mcg', 'Take 1 tablet daily, preferably in the morning.', '2024-03-15', '2024-06-15', 1, ARRAY['08:00'], false, '2024-03-15T10:30:00Z'),
  ('aed00003-0003-0003-0003-000000000003', 'e0004004-0004-0004-0004-000000000004', 'Calcium Carbonate', '500mg', 'Take 1 tablet twice daily. Separate from iron supplement by at least 2 hours.', '2024-06-14', '2024-11-15', 2, ARRAY['12:00', '20:00'], true, '2024-06-14T10:30:00Z'),
  ('aed00004-0004-0004-0004-000000000004', 'e0001001-0001-0001-0001-000000000001', 'Prenatal Vitamins', '1 tablet', 'Take 1 tablet daily after breakfast.', '2024-03-15', '2024-11-15', 1, ARRAY['09:00'], true, '2024-03-15T10:30:00Z'),
  ('aed00005-0005-0005-0005-000000000005', 'e0005005-0005-0005-0005-000000000005', 'Ferrous Sulfate', '325mg', 'Take 1 tablet daily with vitamin C for better absorption. For mild anemia.', '2024-04-25', '2024-12-20', 1, ARRAY['08:00'], true, '2024-04-25T11:30:00Z'),
  ('aed00006-0006-0006-0006-000000000006', 'e0005005-0005-0005-0005-000000000005', 'Prenatal Vitamins with DHA', '1 tablet', 'Take 1 tablet daily after meals.', '2024-04-25', '2024-12-20', 1, ARRAY['09:00'], true, '2024-04-25T11:30:00Z'),
  ('aed00007-0007-0007-0007-000000000007', 'e0007007-0007-0007-0007-000000000007', 'Folic Acid', '800mcg', 'Take 1 tablet daily. Higher dose recommended for first trimester.', '2024-05-10', '2024-08-10', 1, ARRAY['08:00'], true, '2024-05-10T09:30:00Z'),
  ('aed00008-0008-0008-0008-000000000008', 'e0008008-0008-0008-0008-000000000008', 'Prenatal Vitamins', '1 tablet', 'Take 1 tablet daily after breakfast. Continue throughout pregnancy.', '2024-05-24', '2025-01-10', 1, ARRAY['09:00'], true, '2024-05-24T09:45:00Z');

-- Sample medication intake logs (for yesterday)
INSERT INTO medication_intake_logs (id, medication_id, scheduled_date, dose_index, status, taken_at, recorded_by_user_id, created_at) VALUES
  ('10000001-0001-0001-0001-000000000001', 'aed00001-0001-0001-0001-000000000001', CURRENT_DATE - INTERVAL '1 day', 0, 'taken', (CURRENT_DATE - INTERVAL '1 day' + TIME '08:15:00')::timestamptz, 'd4e5f6a7-b8c9-0123-defa-234567890123', now()),
  ('10000002-0002-0002-0002-000000000002', 'aed00003-0003-0003-0003-000000000003', CURRENT_DATE - INTERVAL '1 day', 0, 'taken', (CURRENT_DATE - INTERVAL '1 day' + TIME '12:10:00')::timestamptz, 'd4e5f6a7-b8c9-0123-defa-234567890123', now()),
  ('10000003-0003-0003-0003-000000000003', 'aed00003-0003-0003-0003-000000000003', CURRENT_DATE - INTERVAL '1 day', 1, 'missed', NULL, 'd4e5f6a7-b8c9-0123-defa-234567890123', now()),
  ('10000004-0004-0004-0004-000000000004', 'aed00004-0004-0004-0004-000000000004', CURRENT_DATE - INTERVAL '1 day', 0, 'taken', (CURRENT_DATE - INTERVAL '1 day' + TIME '09:00:00')::timestamptz, 'd4e5f6a7-b8c9-0123-defa-234567890123', now()),
  ('10000005-0005-0005-0005-000000000005', 'aed00005-0005-0005-0005-000000000005', CURRENT_DATE - INTERVAL '1 day', 0, 'taken', (CURRENT_DATE - INTERVAL '1 day' + TIME '07:45:00')::timestamptz, 'e5f6a7b8-c9d0-1234-efab-345678901234', now()),
  ('10000006-0006-0006-0006-000000000006', 'aed00006-0006-0006-0006-000000000006', CURRENT_DATE - INTERVAL '1 day', 0, 'taken', (CURRENT_DATE - INTERVAL '1 day' + TIME '09:30:00')::timestamptz, 'e5f6a7b8-c9d0-1234-efab-345678901234', now());
