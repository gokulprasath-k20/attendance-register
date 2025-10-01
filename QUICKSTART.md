# Quick Start Guide

Get the Attendance Management System up and running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git installed

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
npm install
```

### 2. Create Supabase Project (3 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to initialize
5. Go to **Project Settings → API**
6. Copy:
   - Project URL
   - anon/public key
   - service_role key

### 3. Set Up Database (2 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire content from `database/schema.sql`
4. Paste and click "Run"
5. Verify tables created in **Table Editor**

### 4. Configure Environment (1 minute)

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXTAUTH_SECRET=run_openssl_rand_base64_32
   NEXTAUTH_URL=http://localhost:3000
   ```

3. Generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

### 5. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create First Admin User (1 minute)

1. Click "Sign Up" on homepage
2. Fill in form:
   - Name: Your name
   - Email: admin@example.com
   - Password: (secure password)
   - Role: **Select "Admin"**
3. Click "Sign Up"
4. Go to Supabase Dashboard → **Authentication → Users**
5. Find your user, copy the ID
6. Go to **SQL Editor**, run:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE user_id = 'paste-user-id-here';
   ```
7. Sign out and sign back in

## You're Done! 🎉

### Next Steps

**Test the System**:

1. **As Admin**:
   - Go to admin dashboard
   - Click "Users" to create test users
   - Generate an OTP for testing

2. **Create Test Student**:
   - Admin Dashboard → Users → Create User
   - Create a student (provide Reg No, Year, Semester)

3. **Test Attendance**:
   - Sign out, sign in as student
   - Enter the OTP you generated
   - Allow location permission
   - Mark attendance

### Common First-Time Issues

**"Module not found" errors**:
```bash
npm install
```

**Location permission denied**:
- Use a browser that supports geolocation
- Allow location permission when prompted
- Use HTTPS in production

**Database connection failed**:
- Verify `.env.local` has correct Supabase credentials
- Check Supabase project is active

**NextAuth errors**:
- Ensure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your dev server

### Default Configuration

- **OTP Expiry**: 5 minutes
- **Max Distance**: 10 meters
- **Lavender Theme**: Purple/indigo gradient

### Customize Settings

Edit `config/app.config.ts` to change:
- Subjects list
- Years and semesters
- Distance threshold
- OTP settings

### Quick Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing Different Roles

Create test users for each role:

**Admin**:
- Full access
- Can manage users
- Can view all attendance

**Staff**:
- Can generate OTPs
- View student attendance (years 2-4)
- Export reports

**Student**:
- Mark attendance with OTP
- View personal attendance
- Check status

### Sample Data

Create sample users via Admin Dashboard → Users:

**Sample Staff**:
- Name: Dr. John Smith
- Email: staff@example.com
- Role: Staff

**Sample Students**:
- Name: Alice Johnson
- Email: student1@example.com
- Role: Student
- Reg No: 2024001
- Year: 2
- Semester: 1

### Mobile Testing

Test on mobile devices:
1. Get your computer's local IP
2. Update `NEXTAUTH_URL` to: `http://YOUR_IP:3000`
3. Access from mobile browser
4. Test geolocation features

### Production Deployment

When ready to deploy:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Add environment variables
   - Deploy

3. **Update Environment**:
   - Set `NEXTAUTH_URL` to your production URL
   - Use HTTPS for production

### Get Help

- Check `README.md` for detailed documentation
- Review `CONFIGURATION.md` for customization options
- See `API.md` for API reference
- Open GitHub issue for bugs

### Troubleshooting

**Reset Everything**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

**Reset Database**:
1. Supabase Dashboard → SQL Editor
2. Drop and recreate tables:
   ```sql
   DROP TABLE attendance CASCADE;
   DROP TABLE otp_sessions CASCADE;
   DROP TABLE profiles CASCADE;
   ```
3. Re-run `database/schema.sql`

---

**Ready to build your attendance system!** 🚀

For detailed documentation, see [README.md](./README.md)
