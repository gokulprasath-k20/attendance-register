# Environment Variables Template

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Attendance Configuration (Optional)
NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE=100
NEXT_PUBLIC_OTP_EXPIRY_MINUTES=5
```

## Required Environment Variables:

1. **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
2. **SUPABASE_URL**: From your Supabase project settings
3. **SUPABASE_ANON_KEY**: From your Supabase project API settings
4. **SUPABASE_SERVICE_ROLE_KEY**: From your Supabase project API settings (keep secret!)

## Setup Instructions:

1. Copy this template to `.env.local`
2. Fill in your actual values
3. Restart the development server
4. Test the `/student` route again
