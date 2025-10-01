# API Documentation

Complete API reference for the Attendance Management System.

## Table of Contents

1. [Authentication](#authentication)
2. [OTP Management](#otp-management)
3. [Attendance](#attendance)
4. [User Management](#user-management)
5. [Error Handling](#error-handling)

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All protected endpoints require authentication via NextAuth.js session.

### Sign Up

Create a new user account.

**Endpoint**: `POST /api/auth/signup`

**Access**: Public

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "student",
  "regNo": "2024001",  // Required for students
  "year": 2,           // Required for students
  "semester": 1,       // Required for students
  "subjects": []       // Optional for staff
}
```

**Success Response** (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "student@example.com"
  }
}
```

**Error Response** (400):
```json
{
  "error": "Missing required fields"
}
```

**Error Response** (400):
```json
{
  "error": "Students must provide registration number, year, and semester"
}
```

### Sign In

Sign in handled by NextAuth.js at `/api/auth/[...nextauth]`

Use NextAuth client methods:
```typescript
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  redirect: false
});
```

## OTP Management

### Generate OTP

Generate a time-limited OTP code for attendance.

**Endpoint**: `POST /api/otp/generate`

**Access**: Admin, Staff only

**Authentication**: Required

**Request Body**:
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "subject": "Computer Science",
  "year": 2,
  "semester": 1
}
```

**Success Response** (201):
```json
{
  "otpSession": {
    "id": "uuid",
    "otp_code": "123456",
    "staff_id": "uuid",
    "admin_lat": 12.9716,
    "admin_lng": 77.5946,
    "subject": "Computer Science",
    "year": 2,
    "semester": 1,
    "created_at": "2025-10-01T15:30:00.000Z",
    "expires_at": "2025-10-01T15:35:00.000Z"
  }
}
```

**Error Response** (401):
```json
{
  "error": "Unauthorized"
}
```

**Error Response** (400):
```json
{
  "error": "Missing required fields"
}
```

**Error Response** (500):
```json
{
  "error": "Failed to generate unique OTP"
}
```

### Verify OTP

Mark attendance using OTP code.

**Endpoint**: `POST /api/otp/verify`

**Access**: Student only

**Authentication**: Required

**Request Body**:
```json
{
  "otpCode": "123456",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Success Response** (201):
```json
{
  "message": "Attendance marked successfully",
  "attendance": {
    "id": "uuid",
    "student_id": "uuid",
    "otp_session_id": "uuid",
    "student_lat": 12.9716,
    "student_lng": 77.5946,
    "distance_meters": 5.23,
    "status": "P",
    "subject": "Computer Science",
    "distance": 5.23,
    "created_at": "2025-10-01T15:32:00.000Z"
  }
}
```

**Error Response** (401):
```json
{
  "error": "Unauthorized"
}
```

**Error Response** (400):
```json
{
  "error": "Invalid OTP code"
}
```

**Error Response** (400):
```json
{
  "error": "OTP has expired"
}
```

**Error Response** (400):
```json
{
  "error": "Attendance already marked for this session"
}
```

## Attendance

### Get Attendance Records

Fetch attendance records with optional filters.

**Endpoint**: `GET /api/attendance`

**Access**: All authenticated users

**Authentication**: Required

**Query Parameters**:
- `date` (optional): Filter by date (YYYY-MM-DD)
- `subject` (optional): Filter by subject
- `year` (optional): Filter by year
- `semester` (optional): Filter by semester

**Example Request**:
```
GET /api/attendance?date=2025-10-01&subject=Computer Science&year=2&semester=1
```

**Success Response** (200):
```json
{
  "attendance": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "otp_session_id": "uuid",
      "student_lat": 12.9716,
      "student_lng": 77.5946,
      "distance_meters": 5.23,
      "status": "P",
      "created_at": "2025-10-01T15:32:00.000Z",
      "profiles": {
        "name": "John Doe",
        "email": "student@example.com",
        "reg_no": "2024001",
        "year": 2,
        "semester": 1
      },
      "otp_sessions": {
        "subject": "Computer Science",
        "year": 2,
        "semester": 1,
        "created_at": "2025-10-01T15:30:00.000Z"
      }
    }
  ]
}
```

**Notes**:
- Students can only see their own attendance
- Staff can see attendance for years 2-4
- Admins can see all attendance

**Error Response** (401):
```json
{
  "error": "Unauthorized"
}
```

**Error Response** (500):
```json
{
  "error": "Failed to fetch attendance"
}
```

## User Management

### List Users

Get all users (Admin only).

**Endpoint**: `GET /api/admin/users`

**Access**: Admin only

**Authentication**: Required

**Success Response** (200):
```json
{
  "users": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "John Doe",
      "email": "student@example.com",
      "role": "student",
      "reg_no": "2024001",
      "year": 2,
      "semester": 1,
      "subjects": null,
      "created_at": "2025-09-01T10:00:00.000Z",
      "updated_at": "2025-09-01T10:00:00.000Z"
    }
  ]
}
```

**Error Response** (401):
```json
{
  "error": "Unauthorized"
}
```

### Create User

Create a new user (Admin only).

**Endpoint**: `POST /api/admin/users`

**Access**: Admin only

**Authentication**: Required

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Jane Smith",
  "role": "staff",
  "subjects": ["Mathematics", "Physics"]  // For staff
}
```

Or for student:
```json
{
  "email": "newstudent@example.com",
  "password": "securepassword123",
  "name": "Jane Doe",
  "role": "student",
  "regNo": "2024002",
  "year": 1,
  "semester": 1
}
```

**Success Response** (201):
```json
{
  "message": "User created successfully"
}
```

**Error Response** (401):
```json
{
  "error": "Unauthorized"
}
```

**Error Response** (400):
```json
{
  "error": "Missing required fields"
}
```

### Delete User

Delete a user (Admin only).

**Endpoint**: `DELETE /api/admin/users?userId={userId}`

**Access**: Admin only

**Authentication**: Required

**Query Parameters**:
- `userId` (required): User ID to delete

**Example Request**:
```
DELETE /api/admin/users?userId=uuid-here
```

**Success Response** (200):
```json
{
  "message": "User deleted successfully"
}
```

**Error Response** (401):
```json
{
  "error": "Unauthorized"
}
```

**Error Response** (400):
```json
{
  "error": "User ID is required"
}
```

**Error Response** (500):
```json
{
  "error": "Failed to delete user"
}
```

**Note**: Deleting a user also deletes their profile via CASCADE.

## Error Handling

### Standard Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- **200 OK**: Successful GET/DELETE request
- **201 Created**: Successful POST request
- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Common Error Messages

#### Authentication Errors

- `"Unauthorized"`: No valid session
- `"Invalid credentials"`: Wrong email/password
- `"Profile not found"`: User profile missing

#### Validation Errors

- `"Missing required fields"`: Required data not provided
- `"Email and password are required"`: Signin validation
- `"Students must provide registration number, year, and semester"`: Student-specific validation

#### OTP Errors

- `"Invalid OTP code"`: OTP doesn't exist
- `"OTP has expired"`: OTP validity period ended
- `"Attendance already marked for this session"`: Duplicate attendance attempt
- `"Failed to generate unique OTP"`: System couldn't create unique code

#### Location Errors

- `"Failed to get location"`: Geolocation API error
- `"Location permission denied"`: User denied permission

### Error Response Examples

**Validation Error**:
```json
{
  "error": "Students must provide registration number, year, and semester"
}
```

**Authentication Error**:
```json
{
  "error": "Unauthorized"
}
```

**Business Logic Error**:
```json
{
  "error": "Attendance already marked for this session"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:

- Rate limits per IP address
- Rate limits per user session
- Specific limits for OTP generation

Example implementation:
```typescript
// Future rate limiting
const MAX_REQUESTS_PER_MINUTE = 10;
```

## Webhooks

Webhooks are not currently implemented but can be added for:

- Attendance marked notifications
- OTP generation alerts
- User creation/deletion events

## Data Models

### Profile
```typescript
{
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'student';
  reg_no: string | null;
  year: number | null;
  semester: number | null;
  subjects: string[] | null;
  created_at: string;
  updated_at: string;
}
```

### OTP Session
```typescript
{
  id: string;
  otp_code: string;
  staff_id: string;
  admin_lat: number;
  admin_lng: number;
  subject: string;
  year: number;
  semester: number;
  created_at: string;
  expires_at: string;
}
```

### Attendance
```typescript
{
  id: string;
  student_id: string;
  otp_session_id: string;
  student_lat: number;
  student_lng: number;
  distance_meters: number;
  status: 'P' | 'A';
  created_at: string;
}
```

## Testing API

### Using cURL

**Sign up**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "student",
    "regNo": "2024999",
    "year": 2,
    "semester": 1
  }'
```

**Generate OTP** (requires authentication):
```bash
curl -X POST http://localhost:3000/api/otp/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "subject": "Mathematics",
    "year": 2,
    "semester": 1
  }'
```

### Using Postman

1. Import API endpoints
2. Set up environment variables for base URL
3. Use NextAuth session cookie for authenticated requests
4. Test all endpoints with various scenarios

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create new collection
3. Add requests with authentication headers
4. Test and document responses

## Security Considerations

1. **HTTPS Required**: Always use HTTPS in production for geolocation
2. **Session Management**: Sessions handled by NextAuth.js
3. **SQL Injection**: Supabase client prevents SQL injection
4. **XSS Protection**: Next.js provides built-in XSS protection
5. **CSRF Protection**: NextAuth.js includes CSRF protection

## Versioning

Current Version: **v1.0.0**

Future versions will be documented with breaking changes and migration guides.

---

For additional support, refer to the main README.md and CONFIGURATION.md files.
