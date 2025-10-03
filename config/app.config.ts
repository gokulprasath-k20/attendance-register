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
  ADMIN_SIGNIN: '/auth/admin/signin',
  STAFF_SIGNIN: '/auth/staff/signin',
  STUDENT_SIGNIN: '/auth/student/signin',
  ADMIN_SIGNUP: '/auth/admin/signup',
  STAFF_SIGNUP: '/auth/staff/signup',
  STUDENT_SIGNUP: '/auth/student/signup',
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
  YEARS: [2, 3, 4], // Only years 2-4 are allowed
  SEMESTERS: [1, 2], // Internal representation: 1=first sem of year, 2=second sem of year
  
  // Mapping of subjects by year and semester (internal 1,2 maps to actual semester numbers)
  SUBJECTS_BY_YEAR_SEMESTER: {
    2: {
      1: ['DM', 'DPCO', 'DSA', 'FDS', 'OOPS'], // 2nd Year / 3rd Semester
      2: ['TOC', 'OS', 'DBMS', 'ESS', 'WE', 'AI & ML'], // 2nd Year / 4th Semester
    },
    3: {
      1: ['FSWD', 'ES & IoT', 'STA', 'CC', 'DC', 'CN'], // 3rd Year / 5th Semester
      2: ['Dummy Subject 1', 'Dummy Subject 2', 'Dummy Subject 3'], // 3rd Year / 6th Semester
    },
    4: {
      1: ['Dummy Subject 1', 'Dummy Subject 2', 'Dummy Subject 3'], // 4th Year / 7th Semester
      2: ['Dummy Subject 1', 'Dummy Subject 2', 'Dummy Subject 3'], // 4th Year / 8th Semester
    },
  } as const,
  
  // All unique subjects across all years and semesters
  ALL_SUBJECTS: [
    'DM', 'DPCO', 'DSA', 'FDS', 'OOPS',
    'TOC', 'OS', 'DBMS', 'ESS', 'WE', 'AI & ML',
    'FSWD', 'ES & IoT', 'STA', 'CC', 'DC', 'CN',
    'Dummy Subject 1', 'Dummy Subject 2', 'Dummy Subject 3',
  ] as const,
  
  // Periods per day
  PERIODS: [1, 2, 3, 4, 5, 6, 7, 8],
} as const;

// Query client configuration - Optimized for performance
export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes (longer stale time)
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes (longer cache)
  REFETCH_ON_WINDOW_FOCUS: false, // Disable refetch on focus
  RETRY: 1,
  REFETCH_ON_RECONNECT: false, // Disable refetch on reconnect
  REFETCH_INTERVAL: false, // Disable automatic refetching
} as const;

// Navigation menu configuration
export const NAVIGATION_MENU = {
  admin: [
    // Dashboard button removed
  ],
  staff: [
    // Dashboard button removed
  ],
  student: [
    // Dashboard button removed
  ],
} as const;

// Export format configuration
export const EXPORT_CONFIG = {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  EXCEL_FILENAME_PREFIX: 'attendance_report_',
  PDF_FILENAME_PREFIX: 'attendance_report_',
} as const;
