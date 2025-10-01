# Configuration Guide

This document provides detailed information about configuring the Attendance Management System.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Application Configuration](#application-configuration)
3. [Database Configuration](#database-configuration)
4. [Academic Settings](#academic-settings)
5. [Attendance Rules](#attendance-rules)
6. [Customization](#customization)

## Environment Variables

### Required Variables

#### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
```
- Your Supabase project URL
- Format: `https://xxxxxxxxxxxxx.supabase.co`
- Found in: Project Settings → API

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
- Supabase anonymous (public) key
- Safe to expose in client-side code
- Found in: Project Settings → API

```env
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
- Supabase service role key for admin operations
- **Keep secret** - never expose in client code
- Found in: Project Settings → API

#### NextAuth Configuration

```env
NEXTAUTH_SECRET=your_random_secret_key
```
- Secret key for JWT encryption
- Generate using: `openssl rand -base64 32`
- Must be random and secure

```env
NEXTAUTH_URL=http://localhost:3000
```
- Base URL of your application
- Development: `http://localhost:3000`
- Production: Your deployed URL (e.g., `https://yourdomain.com`)

### Optional Variables (with defaults)

```env
NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE=10
```
- Maximum distance in meters for "Present" status
- Default: 10 meters
- Increase for larger coverage areas
- Decrease for stricter attendance

```env
NEXT_PUBLIC_OTP_EXPIRY_MINUTES=5
```
- OTP validity duration in minutes
- Default: 5 minutes
- Adjust based on class size and marking time needed

## Application Configuration

Located in `config/app.config.ts`

### User Roles

```typescript
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
} as const;
```

**Customization**: Add new roles by extending this object and updating database constraints.

### Routes

```typescript
export const ROUTES = {
  HOME: '/',
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  STAFF_DASHBOARD: '/staff',
  STUDENT_DASHBOARD: '/student',
} as const;
```

**Customization**: Modify routes to match your URL structure.

### Protected Routes

```typescript
export const PROTECTED_ROUTES = {
  admin: ['/admin'],
  staff: ['/staff'],
  student: ['/student'],
} as const;
```

**Customization**: Add new protected routes for each role.

### Attendance Configuration

```typescript
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
```

**Customization Options**:
- `MAX_DISTANCE_METERS`: Geofencing radius
- `OTP_EXPIRY_MINUTES`: OTP validity period
- `OTP_LENGTH`: Number of digits in OTP (affects generation)
- `STATUS`: Modify status codes if needed

### Academic Configuration

```typescript
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
```

**Customization**:
- Add/remove years (e.g., 5-year programs)
- Modify semesters (e.g., quarterly system: [1, 2, 3, 4])
- Update subjects list for your institution

### Query Configuration

```typescript
export const QUERY_CONFIG = {
  STALE_TIME: 60 * 1000, // 1 minute
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  REFETCH_ON_WINDOW_FOCUS: true,
  RETRY: 1,
} as const;
```

**Performance Tuning**:
- `STALE_TIME`: How long data is fresh (milliseconds)
- `CACHE_TIME`: How long unused data stays in cache
- `REFETCH_ON_WINDOW_FOCUS`: Auto-refresh on window focus
- `RETRY`: Number of retry attempts on failed requests

### Navigation Menu

```typescript
export const NAVIGATION_MENU = {
  admin: [
    { name: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
    { name: 'Users', href: ROUTES.ADMIN_USERS },
  ],
  staff: [
    { name: 'Dashboard', href: ROUTES.STAFF_DASHBOARD },
  ],
  student: [
    { name: 'Dashboard', href: ROUTES.STUDENT_DASHBOARD },
  ],
} as const;
```

**Customization**: Add new menu items for each role.

### Export Configuration

```typescript
export const EXPORT_CONFIG = {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  EXCEL_FILENAME_PREFIX: 'attendance_report_',
  PDF_FILENAME_PREFIX: 'attendance_report_',
} as const;
```

**Customization**: Modify date/time formats and filename prefixes.

## Database Configuration

### Connection

Database connection is handled automatically through Supabase environment variables. No additional configuration needed.

### Row Level Security (RLS)

RLS policies are defined in `database/schema.sql`. Key policies:

**Profiles Table**:
- Users can view their own profile
- Admins can view all profiles
- Staff can view student profiles (years 2-4)

**OTP Sessions Table**:
- Admin/Staff can create sessions
- Admin/Staff can view all sessions
- Students can view active sessions for their year/semester

**Attendance Table**:
- Students can mark their own attendance
- Students can view their own attendance
- Admins can view all attendance
- Staff can view attendance for years 2-4

**Customization**: Modify RLS policies in `database/schema.sql` to adjust access rules.

## Academic Settings

### Adding New Subjects

1. Open `config/app.config.ts`
2. Add subjects to `ACADEMIC_CONFIG.SUBJECTS` array
3. Subjects appear in OTP generation forms

Example:
```typescript
SUBJECTS: [
  'Mathematics',
  'Physics',
  'Your New Subject', // Add here
],
```

### Changing Academic Structure

**For Quarterly Systems**:
```typescript
SEMESTERS: [1, 2, 3, 4],
```

**For 5-Year Programs**:
```typescript
YEARS: [1, 2, 3, 4, 5],
```

**Important**: After changing year/semester structure:
1. Update database constraints in `database/schema.sql`
2. Run migration to update constraints

## Attendance Rules

### Distance Calculation

Uses Haversine formula for accurate geographic distance:
- Accounts for Earth's curvature
- Accuracy within 1 meter
- Not affected by altitude

**Formula** (implemented in `lib/utils/geolocation.ts`):
```typescript
const R = 6371e3; // Earth's radius in meters
// ... Haversine calculation
```

### Status Determination

```typescript
if (distance <= MAX_DISTANCE_METERS) {
  status = 'P'; // Present
} else {
  status = 'A'; // Absent
}
```

**Customization**: Add additional status types:
1. Modify database constraint:
```sql
CHECK (status IN ('P', 'A', 'L')) -- Add 'L' for Late
```
2. Update `ATTENDANCE_CONFIG.STATUS`
3. Implement logic in `app/api/otp/verify/route.ts`

### OTP Generation

**Current Logic**:
- Generates 6-digit random code
- Checks uniqueness against database
- Up to 10 attempts to generate unique code
- Stores with expiry timestamp

**Customization** (`lib/utils/otp.ts`):
- Change `OTP_LENGTH` in config
- Modify character set (currently digits only)
- Adjust uniqueness check attempts

## Customization

### Theming

#### Colors

Located in `app/globals.css`:

```css
:root {
  --lavender-500: #a855f7;  /* Primary color */
  --lavender-600: #9333ea;  /* Darker shade */
}
```

**Change Theme**:
1. Update CSS variables
2. Modify Tailwind classes in components
3. Update gradient classes (e.g., `from-purple-600 to-indigo-600`)

#### Custom Animations

Add animations in `app/globals.css`:

```css
@keyframes your-animation {
  from { /* start state */ }
  to { /* end state */ }
}
```

### Adding New Features

#### New Dashboard Section

1. Create component in `components/`
2. Add to appropriate dashboard page
3. Create API route if needed in `app/api/`
4. Update navigation menu in config

#### New User Role

1. Add role to `USER_ROLES` in config
2. Update database constraint:
```sql
CHECK (role IN ('admin', 'staff', 'student', 'new_role'))
```
3. Add RLS policies for new role
4. Create dashboard page: `app/new-role/page.tsx`
5. Update middleware for route protection
6. Add navigation menu items

### API Customization

#### Rate Limiting

Add rate limiting in API routes:

```typescript
// Example rate limiter
const rateLimiter = new Map();

export async function POST(request: NextRequest) {
  const ip = request.ip;
  // Implement rate limiting logic
}
```

#### Custom Validations

Add validations in API routes:

```typescript
// Validation example
if (distance > 1000) {
  return NextResponse.json(
    { error: 'Location too far from any campus' },
    { status: 400 }
  );
}
```

### Mobile Responsiveness

All components use Tailwind's responsive classes:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)

**Adjust breakpoints** in Tailwind config if needed.

## Performance Optimization

### React Query Settings

Adjust in `config/app.config.ts`:

```typescript
export const QUERY_CONFIG = {
  STALE_TIME: 30 * 1000,  // More aggressive caching
  CACHE_TIME: 10 * 60 * 1000,  // Longer cache retention
  REFETCH_ON_WINDOW_FOCUS: false,  // Disable auto-refetch
  RETRY: 3,  // More retry attempts
};
```

### Database Indexing

Indexes are already created in `database/schema.sql`. Add more if needed:

```sql
CREATE INDEX idx_custom_field ON table_name(field_name);
```

### Image Optimization

Next.js automatically optimizes images. Use `next/image`:

```tsx
import Image from 'next/image';
<Image src="/path" alt="..." width={100} height={100} />
```

## Security Best Practices

1. **Never commit `.env.local`** - Use `.gitignore`
2. **Rotate secrets regularly** - Especially `NEXTAUTH_SECRET`
3. **Use HTTPS in production** - Required for geolocation
4. **Review RLS policies** - Ensure proper access control
5. **Validate all inputs** - Both client and server side
6. **Use service role key carefully** - Only in API routes, never client

## Monitoring and Logging

### Enable Logging

Add to API routes:

```typescript
console.log('[API] Operation:', { user, action, timestamp: new Date() });
```

### Error Tracking

Integrate error tracking service (e.g., Sentry):

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // operation
} catch (error) {
  Sentry.captureException(error);
}
```

## Backup and Recovery

### Database Backups

Supabase provides automatic backups. For manual backups:

1. Go to Supabase Dashboard
2. Navigate to Database → Backups
3. Create manual backup

### Export Data

Use the built-in export features or:

```sql
COPY (SELECT * FROM attendance) TO '/path/backup.csv' CSV HEADER;
```

## Support and Updates

- Check configuration after updating dependencies
- Review Supabase dashboard for usage limits
- Monitor API logs for errors
- Test configuration changes in development first

---

For additional help, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
