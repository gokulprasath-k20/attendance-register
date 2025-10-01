# Setup Checklist ✅

Complete step-by-step checklist for setting up the Attendance Management System.

## Pre-Setup Requirements

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Supabase account created
- [ ] Modern web browser (Chrome, Firefox, Safari, Edge)

---

## Phase 1: Initial Setup (5 minutes)

### 1.1 Project Installation
- [ ] Navigate to project directory
- [ ] Run `npm install`
- [ ] Wait for dependencies to install
- [ ] Verify no errors in terminal

### 1.2 Verify Installation
- [ ] Check `node_modules/` folder exists
- [ ] Run `npm run type-check` (should pass)
- [ ] Run `npm run lint` (should pass or show warnings only)

---

## Phase 2: Supabase Setup (10 minutes)

### 2.1 Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up or sign in
- [ ] Click "New Project"
- [ ] Fill in:
  - [ ] Project name
  - [ ] Database password (save this!)
  - [ ] Region (choose closest to your users)
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for initialization

### 2.2 Get API Credentials
- [ ] Go to Project Settings (gear icon)
- [ ] Navigate to API section
- [ ] Copy and save:
  - [ ] Project URL
  - [ ] anon/public key
  - [ ] service_role key (⚠️ keep secret!)

### 2.3 Run Database Migration
- [ ] In Supabase Dashboard, go to SQL Editor
- [ ] Click "New Query"
- [ ] Open `database/schema.sql` from project
- [ ] Copy entire content
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" (or press Ctrl+Enter)
- [ ] Verify success message
- [ ] Go to Table Editor
- [ ] Confirm 3 tables exist:
  - [ ] profiles
  - [ ] otp_sessions
  - [ ] attendance

### 2.4 Verify RLS Policies
- [ ] In Table Editor, select each table
- [ ] Click on "..." menu → "View Policies"
- [ ] Confirm policies are enabled:
  - [ ] profiles: 6 policies
  - [ ] otp_sessions: 3 policies
  - [ ] attendance: 4 policies

---

## Phase 3: Environment Configuration (3 minutes)

### 3.1 Create Environment File
- [ ] Copy `env.example` to `.env.local`
  ```bash
  cp env.example .env.local
  ```
- [ ] Open `.env.local` in text editor

### 3.2 Fill in Supabase Credentials
- [ ] Replace `your_supabase_url` with Project URL
- [ ] Replace `your_anon_key` with anon key
- [ ] Replace `your_service_role_key` with service_role key

### 3.3 Generate NextAuth Secret
- [ ] Run in terminal:
  ```bash
  openssl rand -base64 32
  ```
- [ ] Copy the output
- [ ] Replace `your_secret_key_here` with generated secret

### 3.4 Set Application URL
- [ ] Set `NEXTAUTH_URL=http://localhost:3000`
- [ ] (For production, update to your deployed URL)

### 3.5 Optional Configuration
- [ ] Review `NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE` (default: 10 meters)
- [ ] Review `NEXT_PUBLIC_OTP_EXPIRY_MINUTES` (default: 5 minutes)
- [ ] Adjust if needed

### 3.6 Verify Environment File
- [ ] Confirm no placeholder values remain
- [ ] Confirm no trailing spaces
- [ ] Save file
- [ ] Verify `.env.local` is in `.gitignore`

---

## Phase 4: First Run (2 minutes)

### 4.1 Start Development Server
- [ ] Run `npm run dev`
- [ ] Wait for compilation
- [ ] Look for: "Ready in X seconds"
- [ ] Check for any errors

### 4.2 Open Application
- [ ] Open browser
- [ ] Navigate to http://localhost:3000
- [ ] Verify homepage loads
- [ ] Check for:
  - [ ] Attendance Management System title
  - [ ] Sign In / Sign Up buttons
  - [ ] Feature showcase cards
  - [ ] Responsive design

### 4.3 Test Basic Navigation
- [ ] Click "Sign Up"
- [ ] Verify signup form loads
- [ ] Click "Sign In"
- [ ] Verify signin form loads
- [ ] Click browser back to homepage

---

## Phase 5: Create Admin User (5 minutes)

### 5.1 Register First User
- [ ] Click "Sign Up" on homepage
- [ ] Fill in form:
  - [ ] Name: Your name
  - [ ] Email: your-email@example.com
  - [ ] Password: Secure password (remember this!)
  - [ ] Role: Select "Admin"
- [ ] Click "Sign up"
- [ ] Wait for success message
- [ ] Verify redirected to sign in page

### 5.2 Verify User in Supabase
- [ ] Go to Supabase Dashboard
- [ ] Navigate to Authentication → Users
- [ ] Verify your user appears
- [ ] Copy the User ID (UUID format)

### 5.3 Set Admin Role
- [ ] In Supabase, go to SQL Editor
- [ ] Create new query
- [ ] Paste:
  ```sql
  UPDATE profiles 
  SET role = 'admin' 
  WHERE user_id = 'paste-your-user-id-here';
  ```
- [ ] Replace with your actual User ID
- [ ] Run query
- [ ] Verify "Success. 1 rows affected."

### 5.4 Verify Admin Access
- [ ] Go back to application
- [ ] Sign in with your credentials
- [ ] Verify redirected to `/admin` dashboard
- [ ] Confirm navigation shows:
  - [ ] Dashboard link
  - [ ] Users link
  - [ ] Your name
  - [ ] "admin" badge
  - [ ] Sign Out button

---

## Phase 6: Create Test Users (10 minutes)

### 6.1 Create Test Staff
- [ ] Click "Users" in navigation
- [ ] Click "Create User"
- [ ] Fill in:
  - [ ] Name: Test Staff
  - [ ] Email: staff@test.com
  - [ ] Password: teststaff123
  - [ ] Role: Staff
- [ ] Click "Create"
- [ ] Verify success message
- [ ] Verify user appears in table

### 6.2 Create Test Students
Create Student 1:
- [ ] Click "Create User"
- [ ] Fill in:
  - [ ] Name: Student One
  - [ ] Email: student1@test.com
  - [ ] Password: student123
  - [ ] Role: Student
  - [ ] Reg No: 2024001
  - [ ] Year: 2
  - [ ] Semester: 1
- [ ] Click "Create"
- [ ] Verify success

Create Student 2:
- [ ] Repeat with:
  - [ ] Name: Student Two
  - [ ] Email: student2@test.com
  - [ ] Password: student123
  - [ ] Reg No: 2024002
  - [ ] Year: 2
  - [ ] Semester: 1

### 6.3 Verify All Users
- [ ] Confirm 4 users total in table:
  - [ ] 1 Admin (you)
  - [ ] 1 Staff
  - [ ] 2 Students

---

## Phase 7: Test Core Features (15 minutes)

### 7.1 Test OTP Generation (as Admin)
- [ ] Navigate to Admin Dashboard
- [ ] Fill in OTP form:
  - [ ] Subject: Computer Science
  - [ ] Year: 2
  - [ ] Semester: 1
- [ ] Click "Generate OTP"
- [ ] Allow location permission when prompted
- [ ] Verify success toast with 6-digit code
- [ ] Copy the OTP code

### 7.2 Test Attendance Marking (as Student)
- [ ] Sign out from admin
- [ ] Sign in as student1@test.com
- [ ] Verify on student dashboard
- [ ] Paste OTP code in form
- [ ] Click "Mark Attendance"
- [ ] Allow location permission
- [ ] Verify success message
- [ ] Check status (should be P or A based on distance)
- [ ] Verify distance shown

### 7.3 Test Attendance View (as Staff)
- [ ] Sign out
- [ ] Sign in as staff@test.com
- [ ] Verify on staff dashboard
- [ ] Check attendance table
- [ ] Verify student1 record appears
- [ ] Check all columns display correctly

### 7.4 Test Export Features
As Admin or Staff:
- [ ] Navigate to dashboard with attendance
- [ ] Click "Export Excel"
- [ ] Verify Excel file downloads
- [ ] Open Excel file
- [ ] Check formatting and data
- [ ] Close Excel
- [ ] Click "Export PDF"
- [ ] Verify PDF downloads
- [ ] Open PDF file
- [ ] Check layout and data

### 7.5 Test User Management (as Admin)
- [ ] Sign in as admin
- [ ] Go to Users page
- [ ] Try to delete a test user
- [ ] Confirm deletion
- [ ] Verify user removed from table
- [ ] Verify success message

---

## Phase 8: Mobile Testing (10 minutes)

### 8.1 Prepare for Mobile
- [ ] Find your computer's local IP
  - Windows: `ipconfig`
  - Mac/Linux: `ifconfig`
- [ ] Update `.env.local`:
  - [ ] Change `NEXTAUTH_URL` to `http://YOUR_IP:3000`
- [ ] Restart dev server
- [ ] Verify still works on computer

### 8.2 Test on Mobile Device
- [ ] Connect mobile to same WiFi
- [ ] Open browser on mobile
- [ ] Navigate to `http://YOUR_IP:3000`
- [ ] Test sign in
- [ ] Test OTP generation
- [ ] Test attendance marking
- [ ] Verify responsive design
- [ ] Test location permission

### 8.3 Revert for Development
- [ ] Change `NEXTAUTH_URL` back to `http://localhost:3000`
- [ ] Restart dev server

---

## Phase 9: Configuration Customization (Optional, 15 minutes)

### 9.1 Customize Academic Settings
- [ ] Open `config/app.config.ts`
- [ ] Review `ACADEMIC_CONFIG.SUBJECTS`
- [ ] Add/remove subjects as needed
- [ ] Review years and semesters
- [ ] Adjust if needed
- [ ] Save file

### 9.2 Customize Distance Threshold
Option 1 - Environment Variable:
- [ ] Edit `.env.local`
- [ ] Set `NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE=20` (or your value)
- [ ] Restart server

Option 2 - Config File:
- [ ] Edit `config/app.config.ts`
- [ ] Update default value in `ATTENDANCE_CONFIG.MAX_DISTANCE_METERS`
- [ ] Restart server

### 9.3 Customize OTP Expiry
- [ ] Edit `.env.local` or `config/app.config.ts`
- [ ] Set `NEXT_PUBLIC_OTP_EXPIRY_MINUTES` as desired
- [ ] Restart server

### 9.4 Customize Theme Colors
- [ ] Open `app/globals.css`
- [ ] Modify color variables in `:root`
- [ ] Save and check browser (auto-reload)

---

## Phase 10: Production Preparation (15 minutes)

### 10.1 Review Configuration
- [ ] Check all environment variables
- [ ] Verify no hardcoded values
- [ ] Review RLS policies
- [ ] Check error handling

### 10.2 Run Quality Checks
- [ ] Run `npm run type-check` - should pass
- [ ] Run `npm run lint` - fix any errors
- [ ] Run `npm run build` - should succeed
- [ ] Run `npm start` - test production build
- [ ] Test key features in production mode
- [ ] Stop server (Ctrl+C)

### 10.3 Prepare for Deployment
- [ ] Create GitHub repository (if not done)
- [ ] Add all files to git:
  ```bash
  git add .
  git commit -m "Initial commit - Ready for deployment"
  ```
- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```

### 10.4 Review Documentation
- [ ] Read DEPLOYMENT.md
- [ ] Choose hosting platform (Vercel recommended)
- [ ] Prepare production environment variables
- [ ] Generate new NEXTAUTH_SECRET for production

---

## Verification Checklist

### ✅ Installation Verified
- [ ] npm install completed without errors
- [ ] All dependencies present in node_modules
- [ ] Type checking passes
- [ ] Linting passes (or only warnings)

### ✅ Supabase Connected
- [ ] Database tables created
- [ ] RLS policies active
- [ ] Can connect from application
- [ ] Admin user created and verified

### ✅ Core Features Working
- [ ] User authentication (signup/signin)
- [ ] Role-based dashboards
- [ ] OTP generation
- [ ] Attendance marking
- [ ] Geolocation capture
- [ ] Distance calculation
- [ ] Attendance viewing
- [ ] User management
- [ ] Export to Excel
- [ ] Export to PDF

### ✅ Testing Complete
- [ ] Admin role tested
- [ ] Staff role tested
- [ ] Student role tested
- [ ] Mobile responsive tested
- [ ] Error scenarios tested

### ✅ Ready for Deployment
- [ ] Configuration customized
- [ ] Quality checks passed
- [ ] Documentation reviewed
- [ ] Code committed to Git

---

## Troubleshooting

If you encounter issues during setup:

### Common Issues

**npm install fails**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database connection fails**:
- Verify Supabase credentials in .env.local
- Check Supabase project is active
- Ensure service_role key is correct

**Location not working**:
- Use HTTPS in production
- Allow location permission in browser
- Check device location services enabled

**OTP generation fails**:
- Verify user role (must be admin/staff)
- Check geolocation permission
- Review console for errors

**Build fails**:
- Run `npm run type-check` to find errors
- Fix TypeScript errors
- Ensure all imports are correct

---

## Getting Help

1. **Check Documentation**:
   - README.md - Main docs
   - QUICKSTART.md - Quick setup
   - CONFIGURATION.md - Config details
   - API.md - API reference
   - DEPLOYMENT.md - Deploy guide

2. **Review Console**:
   - Browser DevTools Console
   - Terminal output
   - Network tab for API errors

3. **Supabase Dashboard**:
   - Check Database logs
   - Review Authentication logs
   - Verify API usage

---

## Next Steps After Setup

Once setup is complete:

1. **Customize** for your institution
2. **Test** thoroughly with real users
3. **Deploy** to production
4. **Monitor** usage and performance
5. **Gather** feedback
6. **Iterate** and improve

---

## Setup Time Estimate

- **Quick Setup**: 30-45 minutes (following QUICKSTART.md)
- **Complete Setup**: 1-2 hours (following this checklist)
- **With Customization**: 2-3 hours
- **With Testing**: 3-4 hours

---

**Setup Complete!** 🎉

You now have a fully functional attendance management system. Check PROJECT_SUMMARY.md for feature overview.
