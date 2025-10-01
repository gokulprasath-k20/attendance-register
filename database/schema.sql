-- Attendance Management System Database Schema
-- This file contains the complete database schema for Supabase

-- ============================================================================
-- CLEANUP (Uncomment if you need to reset the database)
-- ============================================================================
-- WARNING: This will delete ALL data!
/*
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view student profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admin and staff can create OTP sessions" ON otp_sessions;
DROP POLICY IF EXISTS "Admin and staff can view OTP sessions" ON otp_sessions;
DROP POLICY IF EXISTS "Students can view relevant OTP sessions" ON otp_sessions;
DROP POLICY IF EXISTS "Students can mark attendance" ON attendance;
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can view student attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Students can create appeals" ON attendance_appeals;
DROP POLICY IF EXISTS "Students can view own appeals" ON attendance_appeals;
DROP POLICY IF EXISTS "Admins can manage appeals" ON attendance_appeals;

DROP VIEW IF EXISTS attendance_stats;
DROP TABLE IF EXISTS attendance_appeals CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS otp_sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_otps CASCADE;
DROP FUNCTION IF EXISTS get_attendance_percentage CASCADE;
DROP FUNCTION IF EXISTS has_minimum_attendance CASCADE;
DROP FUNCTION IF EXISTS get_attendance_report CASCADE;
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  reg_no TEXT,  -- For students only
  year INTEGER CHECK (year IN (1, 2, 3, 4)),  -- For students only
  semester INTEGER CHECK (semester IN (1, 2)),  -- For students only
  subjects TEXT[],  -- For staff: subjects they teach
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- OTP SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  otp_code TEXT NOT NULL UNIQUE,
  staff_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  admin_lat NUMERIC NOT NULL,
  admin_lng NUMERIC NOT NULL,
  subject TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year IN (1, 2, 3, 4)),
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_sessions_code ON otp_sessions(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_staff_id ON otp_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_expires_at ON otp_sessions(expires_at);

-- ============================================================================
-- ATTENDANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  otp_session_id UUID REFERENCES otp_sessions(id) ON DELETE CASCADE,
  student_lat NUMERIC NOT NULL,
  student_lng NUMERIC NOT NULL,
  distance_meters NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('P', 'A')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, otp_session_id)  -- Prevent duplicate attendance
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_otp_session_id ON attendance(otp_session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view student profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow staff to view student profiles for years 2-4
CREATE POLICY "Staff can view student profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'staff'
    )
    AND role = 'student'
    AND year IN (2, 3, 4)
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- OTP SESSIONS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin and staff can create OTP sessions" ON otp_sessions;
DROP POLICY IF EXISTS "Admin and staff can view OTP sessions" ON otp_sessions;
DROP POLICY IF EXISTS "Students can view relevant OTP sessions" ON otp_sessions;

-- Allow admin and staff to create OTP sessions
CREATE POLICY "Admin and staff can create OTP sessions"
  ON otp_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Allow admin and staff to view OTP sessions
CREATE POLICY "Admin and staff can view OTP sessions"
  ON otp_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Allow students to view active OTP sessions for their year/semester
CREATE POLICY "Students can view relevant OTP sessions"
  ON otp_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
        AND role = 'student'
        AND year = otp_sessions.year
        AND semester = otp_sessions.semester
    )
    AND expires_at > NOW()
  );

-- ============================================================================
-- ATTENDANCE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can mark attendance" ON attendance;
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can view student attendance" ON attendance;

-- Allow students to create their own attendance
CREATE POLICY "Students can mark attendance"
  ON attendance FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Allow students to view their own attendance
CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = student_id);

-- Allow admin to view all attendance
CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow staff to view attendance for years 2-4
CREATE POLICY "Staff can view student attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.user_id = auth.uid() AND p1.role = 'staff'
    )
    AND EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.user_id = attendance.student_id 
        AND p2.role = 'student'
        AND p2.year IN (2, 3, 4)
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired OTP sessions
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ATTENDANCE STATISTICS VIEW
-- ============================================================================
-- View to easily get attendance statistics per student
CREATE OR REPLACE VIEW attendance_stats AS
SELECT 
  p.user_id,
  p.name,
  p.email,
  p.reg_no,
  p.year,
  p.semester,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN a.status = 'P' THEN 1 END) as present_count,
  COUNT(CASE WHEN a.status = 'A' THEN 1 END) as absent_count,
  ROUND(
    (COUNT(CASE WHEN a.status = 'P' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
    2
  ) as attendance_percentage
FROM profiles p
LEFT JOIN attendance a ON p.user_id = a.student_id
WHERE p.role = 'student'
GROUP BY p.user_id, p.name, p.email, p.reg_no, p.year, p.semester;

-- ============================================================================
-- AUDIT LOG TABLE (Track important actions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE (For future features)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ATTENDANCE APPEALS TABLE (Optional - for disputed attendance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_appeals_student_id ON attendance_appeals(student_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON attendance_appeals(status);

ALTER TABLE attendance_appeals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Students can create appeals" ON attendance_appeals;
DROP POLICY IF EXISTS "Students can view own appeals" ON attendance_appeals;
DROP POLICY IF EXISTS "Admins can manage appeals" ON attendance_appeals;

-- Students can create appeals for their own attendance
CREATE POLICY "Students can create appeals"
  ON attendance_appeals FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can view their own appeals
CREATE POLICY "Students can view own appeals"
  ON attendance_appeals FOR SELECT
  USING (auth.uid() = student_id);

-- Admins can view and update all appeals
CREATE POLICY "Admins can manage appeals"
  ON attendance_appeals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get attendance percentage for a student
CREATE OR REPLACE FUNCTION get_attendance_percentage(student_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_count INTEGER;
  present_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM attendance
  WHERE student_id = student_user_id;
  
  IF total_count = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO present_count
  FROM attendance
  WHERE student_id = student_user_id AND status = 'P';
  
  RETURN ROUND((present_count::NUMERIC / total_count::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to check if student has minimum attendance (e.g., 75%)
CREATE OR REPLACE FUNCTION has_minimum_attendance(student_user_id UUID, minimum_percentage NUMERIC DEFAULT 75)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_attendance_percentage(student_user_id) >= minimum_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to get attendance report for a date range
CREATE OR REPLACE FUNCTION get_attendance_report(
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  subject_filter TEXT DEFAULT NULL,
  year_filter INTEGER DEFAULT NULL,
  semester_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
  student_name TEXT,
  reg_no TEXT,
  year INTEGER,
  semester INTEGER,
  subject TEXT,
  total_sessions BIGINT,
  present_count BIGINT,
  absent_count BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    p.reg_no,
    p.year,
    p.semester,
    os.subject,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN a.status = 'P' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'A' THEN 1 END) as absent_count,
    ROUND(
      (COUNT(CASE WHEN a.status = 'P' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
      2
    ) as percentage
  FROM attendance a
  JOIN profiles p ON a.student_id = p.user_id
  JOIN otp_sessions os ON a.otp_session_id = os.id
  WHERE 
    a.created_at BETWEEN start_date AND end_date
    AND (subject_filter IS NULL OR os.subject = subject_filter)
    AND (year_filter IS NULL OR p.year = year_filter)
    AND (semester_filter IS NULL OR p.semester = semester_filter)
  GROUP BY p.name, p.reg_no, p.year, p.semester, os.subject
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEDULED CLEANUP (PostgreSQL Cron - if enabled in Supabase)
-- ============================================================================
-- Uncomment if you enable pg_cron extension
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps()');

-- ============================================================================
-- INITIAL DATA (Optional - Create first admin user manually)
-- ============================================================================
-- After creating a user through Supabase Auth, you can manually insert:
-- INSERT INTO profiles (user_id, name, email, role)
-- VALUES ('auth-user-id-here', 'Admin Name', 'admin@example.com', 'admin');
