-- Attendance Management System Database Schema
-- Fresh installation (no existence checks)
-- Run this on a NEW database only

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  reg_no TEXT,
  year INTEGER CHECK (year IN (1, 2, 3, 4)),
  semester INTEGER CHECK (semester IN (1, 2)),
  subjects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================================
-- OTP SESSIONS TABLE
-- ============================================================================
CREATE TABLE otp_sessions (
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

CREATE INDEX idx_otp_sessions_code ON otp_sessions(otp_code);
CREATE INDEX idx_otp_sessions_staff_id ON otp_sessions(staff_id);
CREATE INDEX idx_otp_sessions_expires_at ON otp_sessions(expires_at);

-- ============================================================================
-- ATTENDANCE TABLE
-- ============================================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  otp_session_id UUID REFERENCES otp_sessions(id) ON DELETE CASCADE,
  student_lat NUMERIC NOT NULL,
  student_lng NUMERIC NOT NULL,
  distance_meters NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('P', 'A')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, otp_session_id)
);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_otp_session_id ON attendance(otp_session_id);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_created_at ON attendance(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

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

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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
CREATE POLICY "Admin and staff can create OTP sessions"
  ON otp_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin and staff can view OTP sessions"
  ON otp_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

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
CREATE POLICY "Students can mark attendance"
  ON attendance FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

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
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ATTENDANCE STATISTICS VIEW
-- ============================================================================
CREATE VIEW attendance_stats AS
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
-- AUDIT LOG TABLE (Optional)
-- ============================================================================
CREATE TABLE audit_logs (
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

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE (Optional)
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ATTENDANCE APPEALS TABLE (Optional)
-- ============================================================================
CREATE TABLE attendance_appeals (
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

CREATE INDEX idx_appeals_student_id ON attendance_appeals(student_id);
CREATE INDEX idx_appeals_status ON attendance_appeals(status);

ALTER TABLE attendance_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create appeals"
  ON attendance_appeals FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view own appeals"
  ON attendance_appeals FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage appeals"
  ON attendance_appeals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS (Optional)
-- ============================================================================
CREATE FUNCTION get_attendance_percentage(student_user_id UUID)
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

CREATE FUNCTION has_minimum_attendance(student_user_id UUID, minimum_percentage NUMERIC DEFAULT 75)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_attendance_percentage(student_user_id) >= minimum_percentage;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETE - Database setup finished
-- ============================================================================
-- After running this schema, create your first admin user through Supabase Auth,
-- then manually insert a profile record for the admin.
