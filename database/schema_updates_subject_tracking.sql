-- ============================================================================
-- SCHEMA UPDATES FOR ENHANCED SUBJECT TRACKING AND PERIOD SYSTEM
-- Run this file to add period tracking and time-based attendance features
-- ============================================================================

-- Add period tracking to OTP sessions
ALTER TABLE otp_sessions
ADD COLUMN IF NOT EXISTS period_number INTEGER CHECK (period_number >= 1 AND period_number <= 8),
ADD COLUMN IF NOT EXISTS session_date DATE DEFAULT CURRENT_DATE;

-- Create index for faster queries on session date and period
CREATE INDEX IF NOT EXISTS idx_otp_sessions_session_date ON otp_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_period ON otp_sessions(period_number);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_year_semester ON otp_sessions(year, semester);

-- Add index for attendance created_at timestamp for time-based filtering
-- Note: Using created_at directly instead of date() function to avoid immutability issues
CREATE INDEX IF NOT EXISTS idx_attendance_created_at_date ON attendance(created_at);

-- Create a view for active OTP sessions (not expired, for current date)
CREATE OR REPLACE VIEW active_otp_sessions AS
SELECT 
  os.*,
  p.name as staff_name
FROM otp_sessions os
LEFT JOIN profiles p ON os.staff_id = p.user_id
WHERE os.expires_at > NOW()
  AND os.session_date = CURRENT_DATE
ORDER BY os.created_at DESC;

-- Create a function to get available subjects for a year and semester
CREATE OR REPLACE FUNCTION get_subjects_for_year_semester(
  p_year INTEGER,
  p_semester INTEGER
)
RETURNS TEXT[] AS $$
DECLARE
  subjects TEXT[];
BEGIN
  -- 2nd Year / 3rd Semester
  IF p_year = 2 AND p_semester = 1 THEN
    subjects := ARRAY['DM', 'DPCO', 'DSA', 'FDS', 'OOPS'];
  -- 2nd Year / 4th Semester
  ELSIF p_year = 2 AND p_semester = 2 THEN
    subjects := ARRAY['TOC', 'OS', 'DBMS', 'ESS', 'WE', 'AI & ML'];
  -- 3rd Year / 5th Semester
  ELSIF p_year = 3 AND p_semester = 1 THEN
    subjects := ARRAY['FSWD', 'ES & IoT', 'STA', 'CC', 'DC', 'CN'];
  -- 3rd Year / 6th Semester
  ELSIF p_year = 3 AND p_semester = 2 THEN
    subjects := ARRAY['Dummy Subject 1', 'Dummy Subject 2', 'Dummy Subject 3'];
  -- 4th Year / 7th Semester
  ELSIF p_year = 4 AND p_semester = 1 THEN
    subjects := ARRAY['Dummy Subject 1', 'Dummy Subject 2', 'Dummy Subject 3'];
  -- 4th Year / 8th Semester
  ELSIF p_year = 4 AND p_semester = 2 THEN
    subjects := ARRAY['Dummy Subject 1', 'Dummy Subject 2', 'Dummy Subject 3'];
  ELSE
    subjects := ARRAY[]::TEXT[];
  END IF;
  
  RETURN subjects;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to get available semesters for a year
CREATE OR REPLACE FUNCTION get_semesters_for_year(p_year INTEGER)
RETURNS INTEGER[] AS $$
BEGIN
  -- All years have 2 semesters
  -- For year 2: semesters 1 and 2 (which are actually 3rd and 4th semesters)
  -- For year 3: semesters 1 and 2 (which are actually 5th and 6th semesters)
  -- For year 4: semesters 1 and 2 (which are actually 7th and 8th semesters)
  RETURN ARRAY[1, 2];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a view for attendance history with detailed information
CREATE OR REPLACE VIEW attendance_detailed_history AS
SELECT 
  a.id,
  a.student_id,
  a.created_at,
  a.status,
  a.distance_meters,
  p.name as student_name,
  p.reg_no,
  p.year,
  p.semester,
  os.subject,
  os.period_number,
  os.session_date,
  os.year as session_year,
  os.semester as session_semester,
  DATE(a.created_at) as attendance_date,
  TO_CHAR(a.created_at, 'HH24:MI:SS') as attendance_time
FROM attendance a
JOIN profiles p ON a.student_id = p.user_id
JOIN otp_sessions os ON a.otp_session_id = os.id
ORDER BY a.created_at DESC;

-- Create a function to get attendance history with filters
CREATE OR REPLACE FUNCTION get_filtered_attendance(
  p_user_id UUID,
  p_user_role TEXT,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_subject TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_semester INTEGER DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_student_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  student_name TEXT,
  reg_no TEXT,
  year INTEGER,
  semester INTEGER,
  subject TEXT,
  attendance_date DATE,
  attendance_time TEXT,
  status TEXT,
  distance_meters NUMERIC,
  period_number INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    adh.id,
    adh.student_id,
    adh.student_name,
    adh.reg_no,
    adh.year,
    adh.semester,
    adh.subject,
    adh.attendance_date,
    adh.attendance_time,
    adh.status,
    adh.distance_meters,
    adh.period_number
  FROM attendance_detailed_history adh
  WHERE 
    -- Role-based filtering
    (
      (p_user_role = 'student' AND adh.student_id = p_user_id) OR
      (p_user_role = 'staff' AND adh.year IN (2, 3, 4)) OR
      (p_user_role = 'admin')
    )
    -- Date range filter
    AND (p_start_date IS NULL OR adh.attendance_date >= p_start_date)
    AND (p_end_date IS NULL OR adh.attendance_date <= p_end_date)
    -- Subject filter
    AND (p_subject IS NULL OR adh.subject = p_subject)
    -- Year filter
    AND (p_year IS NULL OR adh.session_year = p_year)
    -- Semester filter
    AND (p_semester IS NULL OR adh.session_semester = p_semester)
    -- Status filter (present/absent only)
    AND (p_status IS NULL OR adh.status = p_status)
    -- Specific student filter (for staff/admin)
    AND (p_student_id IS NULL OR adh.student_id = p_student_id)
  ORDER BY adh.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Update semester check constraint to allow 1 and 2
-- (representing first and second semester of each year)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_semester_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_semester_check 
CHECK (semester IN (1, 2));

ALTER TABLE otp_sessions 
DROP CONSTRAINT IF EXISTS otp_sessions_semester_check;

ALTER TABLE otp_sessions 
ADD CONSTRAINT otp_sessions_semester_check 
CHECK (semester IN (1, 2));

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
-- 
-- To get subjects for 2nd year, 1st semester (3rd semester):
-- SELECT get_subjects_for_year_semester(2, 1);
--
-- To get filtered attendance history:
-- SELECT * FROM get_filtered_attendance(
--   'user-uuid',
--   'student',
--   '2025-01-01'::DATE,
--   '2025-12-31'::DATE,
--   'FSWD',
--   3,
--   1,
--   'P',
--   NULL
-- );
--
-- To view active OTP sessions:
-- SELECT * FROM active_otp_sessions;
--
-- ============================================================================
