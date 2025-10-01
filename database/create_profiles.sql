-- ============================================================================
-- CREATE INDIVIDUAL PROFILES
-- ============================================================================
-- Use these after users sign up through the application
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users

-- ============================================================================
-- CREATE ADMIN PROFILE
-- ============================================================================
-- After an admin signs up, run this to set their role:
INSERT INTO profiles (user_id, name, email, role)
VALUES (
  'USER_ID_HERE',           -- Replace with actual user_id from auth.users
  'Admin Name',             -- Admin's full name
  'admin@example.com',      -- Admin's email
  'admin'                   -- Role
);

-- Example:
-- INSERT INTO profiles (user_id, name, email, role)
-- VALUES (
--   '123e4567-e89b-12d3-a456-426614174000',
--   'John Admin',
--   'admin@school.com',
--   'admin'
-- );

-- ============================================================================
-- CREATE STAFF PROFILE
-- ============================================================================
-- For staff members with subjects they teach:
INSERT INTO profiles (user_id, name, email, role, subjects)
VALUES (
  'USER_ID_HERE',                           -- Replace with actual user_id
  'Staff Name',                             -- Staff's full name
  'staff@example.com',                      -- Staff's email
  'staff',                                  -- Role
  ARRAY['Mathematics', 'Physics']           -- Subjects they teach
);

-- Example:
-- INSERT INTO profiles (user_id, name, email, role, subjects)
-- VALUES (
--   '234e5678-e89b-12d3-a456-426614174001',
--   'Dr. Sarah Smith',
--   'sarah.smith@school.com',
--   'staff',
--   ARRAY['Computer Science', 'Electronics']
-- );

-- ============================================================================
-- CREATE STUDENT PROFILE
-- ============================================================================
-- For students with registration number, year, and semester:
INSERT INTO profiles (user_id, name, email, role, reg_no, year, semester)
VALUES (
  'USER_ID_HERE',           -- Replace with actual user_id
  'Student Name',           -- Student's full name
  'student@example.com',    -- Student's email
  'student',                -- Role
  '2024001',                -- Registration number
  2,                        -- Year (1, 2, 3, or 4)
  1                         -- Semester (1 or 2)
);

-- Example:
-- INSERT INTO profiles (user_id, name, email, role, reg_no, year, semester)
-- VALUES (
--   '345e6789-e89b-12d3-a456-426614174002',
--   'Alice Johnson',
--   'alice.johnson@student.school.com',
--   'student',
--   '2024001',
--   2,
--   1
-- );

-- ============================================================================
-- BULK INSERT MULTIPLE STUDENTS
-- ============================================================================
-- Create multiple students at once:
INSERT INTO profiles (user_id, name, email, role, reg_no, year, semester)
VALUES 
  ('USER_ID_1', 'Student 1', 'student1@example.com', 'student', '2024001', 2, 1),
  ('USER_ID_2', 'Student 2', 'student2@example.com', 'student', '2024002', 2, 1),
  ('USER_ID_3', 'Student 3', 'student3@example.com', 'student', '2024003', 2, 1),
  ('USER_ID_4', 'Student 4', 'student4@example.com', 'student', '2024004', 3, 2);

-- ============================================================================
-- HOW TO GET USER_ID FROM AUTH.USERS
-- ============================================================================
-- After a user signs up through your app, find their user_id:

-- Method 1: Find by email
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'user@example.com';

-- Method 2: View all recent users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Method 3: Find users without profiles
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- ============================================================================
-- UPDATE EXISTING PROFILE
-- ============================================================================
-- Update role (use carefully - this bypasses RLS):
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'USER_ID_HERE';

-- Update student details:
UPDATE profiles 
SET 
  reg_no = '2024999',
  year = 3,
  semester = 2
WHERE user_id = 'USER_ID_HERE';

-- Update staff subjects:
UPDATE profiles 
SET subjects = ARRAY['Mathematics', 'Computer Science', 'Physics']
WHERE user_id = 'USER_ID_HERE';

-- ============================================================================
-- DELETE PROFILE
-- ============================================================================
-- Delete a profile (will also delete from auth.users due to CASCADE):
DELETE FROM profiles WHERE user_id = 'USER_ID_HERE';

-- Or delete from auth (will cascade to profiles):
-- This requires service_role key in Supabase
-- Better to do this through the API/admin panel

-- ============================================================================
-- VIEW PROFILES
-- ============================================================================
-- View all profiles:
SELECT * FROM profiles ORDER BY created_at DESC;

-- View by role:
SELECT * FROM profiles WHERE role = 'student';
SELECT * FROM profiles WHERE role = 'staff';
SELECT * FROM profiles WHERE role = 'admin';

-- View students by year:
SELECT name, email, reg_no, year, semester 
FROM profiles 
WHERE role = 'student' AND year = 2;

-- View staff with subjects:
SELECT name, email, subjects 
FROM profiles 
WHERE role = 'staff';

-- ============================================================================
-- TIPS
-- ============================================================================
-- 1. Users must sign up through the app first (creates auth.users record)
-- 2. Then create profile using their user_id
-- 3. Or let the app create profiles automatically during signup
-- 4. For the first admin: sign up through app, then manually set role to 'admin'
-- 5. Staff and students can register themselves through separate signup pages
