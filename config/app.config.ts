/**
 * Application Configuration
 * Centralized configuration for the attendance management system
 */

// User role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Route mappings
export const ROUTES = {
  HOME: '/',
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  STAFF_DASHBOARD: '/staff',
  STUDENT_DASHBOARD: '/student',
} as const;

// Protected routes configuration
export const PROTECTED_ROUTES = {
  admin: ['/admin'],
  staff: ['/staff'],
  student: ['/student'],
} as const;

// Attendance configuration
export const ATTENDANCE_CONFIG = {
  MAX_DISTANCE_METERS: parseInt(
    process.env.NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE || '10',
    10
  ),
  OTP_EXPIRY_MINUTES: parseInt(
    process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES || '5',
    10
  ),
  OTP_LENGTH: 6,
  STATUS: {
    PRESENT: 'P',
    ABSENT: 'A',
  },
} as const;

// Academic configuration
export const ACADEMIC_CONFIG = {
  YEARS: [1, 2, 3, 4],
  SEMESTERS: [1, 2],
  SUBJECTS: [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
  ],
} as const;

// Query client configuration
export const QUERY_CONFIG = {
  STALE_TIME: 60 * 1000, // 1 minute
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  REFETCH_ON_WINDOW_FOCUS: true,
  RETRY: 1,
} as const;

// Navigation menu configuration
export const NAVIGATION_MENU = {
  admin: [
    { name: 'Attendance Records', href: ROUTES.ADMIN_DASHBOARD },
  ],
  staff: [
    { name: 'Dashboard', href: ROUTES.STAFF_DASHBOARD },
  ],
  student: [
    { name: 'Dashboard', href: ROUTES.STUDENT_DASHBOARD },
  ],
} as const;

// Export format configuration
export const EXPORT_CONFIG = {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  EXCEL_FILENAME_PREFIX: 'attendance_report_',
  PDF_FILENAME_PREFIX: 'attendance_report_',
} as const;
