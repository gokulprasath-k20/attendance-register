# Complete File Structure

This document provides a comprehensive overview of all files in the Attendance Management System.

## Project Root

```
avsecitar/
├── 📄 README.md                    # Main documentation
├── 📄 QUICKSTART.md                # 10-minute setup guide
├── 📄 CONFIGURATION.md             # Configuration details
├── 📄 API.md                       # API reference
├── 📄 DEPLOYMENT.md                # Deployment guide
├── 📄 PROJECT_SUMMARY.md           # Project overview
├── 📄 CHANGELOG.md                 # Version history
├── 📄 FILE_STRUCTURE.md            # This file
├── 📄 env.example                  # Environment template
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Dependencies
├── 📄 package-lock.json            # Dependency lock
├── 📄 tsconfig.json                # TypeScript config
├── 📄 next.config.ts               # Next.js config
├── 📄 postcss.config.mjs           # PostCSS config
├── 📄 eslint.config.mjs            # ESLint config
├── 📄 next-env.d.ts                # Next.js types
├── 📄 middleware.ts                # Route protection
│
├── 📁 app/                         # Next.js App Router
│   ├── 📄 layout.tsx               # Root layout
│   ├── 📄 page.tsx                 # Homepage
│   ├── 📄 globals.css              # Global styles
│   │
│   ├── 📁 api/                     # API routes
│   │   ├── 📁 auth/
│   │   │   ├── 📁 [...nextauth]/
│   │   │   │   └── 📄 route.ts     # NextAuth handler
│   │   │   └── 📁 signup/
│   │   │       └── 📄 route.ts     # User registration
│   │   ├── 📁 otp/
│   │   │   ├── 📁 generate/
│   │   │   │   └── 📄 route.ts     # OTP generation
│   │   │   └── 📁 verify/
│   │   │       └── 📄 route.ts     # OTP verification
│   │   ├── 📁 attendance/
│   │   │   └── 📄 route.ts         # Attendance records
│   │   └── 📁 admin/
│   │       └── 📁 users/
│   │           └── 📄 route.ts     # User management
│   │
│   ├── 📁 auth/                    # Auth pages
│   │   ├── 📁 signin/
│   │   │   └── 📄 page.tsx         # Sign in page
│   │   └── 📁 signup/
│   │       └── 📄 page.tsx         # Sign up page
│   │
│   ├── 📁 admin/                   # Admin pages
│   │   ├── 📄 page.tsx             # Admin dashboard
│   │   └── 📁 users/
│   │       └── 📄 page.tsx         # User management
│   │
│   ├── 📁 staff/                   # Staff pages
│   │   └── 📄 page.tsx             # Staff dashboard
│   │
│   └── 📁 student/                 # Student pages
│       └── 📄 page.tsx             # Student dashboard
│
├── 📁 components/                  # React components
│   ├── 📄 navbar.tsx               # Navigation bar
│   ├── 📄 loading-spinner.tsx      # Loading component
│   ├── 📄 toast.tsx                # Toast notifications
│   └── 📄 providers.tsx            # React Query provider
│
├── 📁 config/                      # Configuration
│   └── 📄 app.config.ts            # App configuration
│
├── 📁 database/                    # Database
│   └── 📄 schema.sql               # Database schema
│
├── 📁 lib/                         # Libraries & utilities
│   ├── 📄 auth.ts                  # NextAuth config
│   ├── 📁 supabase/
│   │   └── 📄 client.ts            # Supabase clients
│   └── 📁 utils/
│       ├── 📄 geolocation.ts       # Geolocation utilities
│       ├── 📄 otp.ts               # OTP utilities
│       └── 📄 export.ts            # Export utilities
│
├── 📁 types/                       # TypeScript types
│   └── 📄 next-auth.d.ts           # NextAuth type extensions
│
├── 📁 public/                      # Static assets
│   └── (Next.js default files)
│
├── 📁 src/                         # (Next.js generated)
│   └── 📁 app/
│       ├── 📄 favicon.ico
│       ├── 📄 globals.css
│       ├── 📄 layout.tsx
│       └── 📄 page.tsx
│
└── 📁 node_modules/                # Dependencies (gitignored)
```

---

## File Descriptions

### Root Configuration Files

#### 📄 package.json
**Purpose**: Project metadata and dependencies  
**Key Sections**:
- Scripts: dev, build, start, lint, type-check
- Dependencies: Production packages
- DevDependencies: Development tools

#### 📄 tsconfig.json
**Purpose**: TypeScript compiler configuration  
**Key Settings**:
- Strict mode enabled
- Path aliases (@/* for root)
- JSX preserve for Next.js
- ES2017 target

#### 📄 next.config.ts
**Purpose**: Next.js framework configuration  
**Features**: Default Next.js 15 settings

#### 📄 middleware.ts
**Purpose**: Route protection middleware  
**Functionality**:
- Checks authentication status
- Enforces role-based access
- Redirects unauthorized users

#### 📄 .gitignore
**Purpose**: Git exclusion rules  
**Excludes**:
- node_modules/
- .next/
- .env* files
- Build artifacts

---

### Application Files (app/)

#### 📄 app/layout.tsx
**Purpose**: Root layout component  
**Features**:
- Wraps all pages
- Includes Providers
- Sets up fonts and metadata

#### 📄 app/page.tsx
**Purpose**: Homepage/Landing page  
**Features**:
- Feature showcase
- Role descriptions
- Sign in/up links
- Auto-redirect for authenticated users

#### 📄 app/globals.css
**Purpose**: Global styles and theme  
**Features**:
- Lavender color theme
- Custom animations
- Scrollbar styling
- Tailwind CSS imports

---

### API Routes (app/api/)

#### 📄 app/api/auth/[...nextauth]/route.ts
**Purpose**: NextAuth.js handler  
**Exports**: GET, POST handlers

#### 📄 app/api/auth/signup/route.ts
**Purpose**: User registration endpoint  
**Method**: POST  
**Validates**: Email, password, role, student fields

#### 📄 app/api/otp/generate/route.ts
**Purpose**: OTP generation endpoint  
**Method**: POST  
**Access**: Admin, Staff only  
**Returns**: OTP code and session details

#### 📄 app/api/otp/verify/route.ts
**Purpose**: Attendance marking endpoint  
**Method**: POST  
**Access**: Student only  
**Returns**: Attendance record with status

#### 📄 app/api/attendance/route.ts
**Purpose**: Fetch attendance records  
**Method**: GET  
**Filters**: date, subject, year, semester  
**Access**: All authenticated users (role-filtered)

#### 📄 app/api/admin/users/route.ts
**Purpose**: User management endpoint  
**Methods**: GET, POST, DELETE  
**Access**: Admin only  
**Operations**: List, create, delete users

---

### Authentication Pages (app/auth/)

#### 📄 app/auth/signin/page.tsx
**Purpose**: Sign in page  
**Features**:
- Email/password form
- NextAuth integration
- Error handling
- Toast notifications
- Redirect on success

#### 📄 app/auth/signup/page.tsx
**Purpose**: User registration page  
**Features**:
- Multi-role registration
- Conditional fields (student vs staff)
- Form validation
- Error handling
- Redirect to signin on success

---

### Dashboard Pages

#### 📄 app/admin/page.tsx
**Purpose**: Admin dashboard  
**Features**:
- OTP generation
- View all attendance
- Export buttons (Excel, PDF)
- Full year access

#### 📄 app/admin/users/page.tsx
**Purpose**: User management interface  
**Features**:
- User list table
- Create user modal
- Delete functionality
- Role-based forms

#### 📄 app/staff/page.tsx
**Purpose**: Staff dashboard  
**Features**:
- OTP generation
- View student attendance (years 2-4)
- Export functionality
- Subject filtering

#### 📄 app/student/page.tsx
**Purpose**: Student dashboard  
**Features**:
- Mark attendance form
- Personal attendance history
- Status display
- Distance information

---

### Components (components/)

#### 📄 components/navbar.tsx
**Purpose**: Navigation bar  
**Features**:
- Role-based menu items
- User info display
- Sign out button
- Responsive design

#### 📄 components/loading-spinner.tsx
**Purpose**: Loading indicator  
**Props**: size (sm, md, lg)  
**Usage**: During async operations

#### 📄 components/toast.tsx
**Purpose**: Notification system  
**Types**: success, error, info  
**Features**:
- Auto-dismiss (3 seconds)
- Custom hook (useToast)
- Slide-in animation

#### 📄 components/providers.tsx
**Purpose**: Client-side providers  
**Wraps**:
- SessionProvider (NextAuth)
- QueryClientProvider (React Query)

---

### Configuration (config/)

#### 📄 config/app.config.ts
**Purpose**: Centralized configuration  
**Exports**:
- USER_ROLES
- ROUTES
- PROTECTED_ROUTES
- ATTENDANCE_CONFIG
- ACADEMIC_CONFIG
- QUERY_CONFIG
- NAVIGATION_MENU
- EXPORT_CONFIG

---

### Database (database/)

#### 📄 database/schema.sql
**Purpose**: Complete database schema  
**Includes**:
- Table definitions (profiles, otp_sessions, attendance)
- Indexes for performance
- RLS policies
- Triggers
- Helper functions

---

### Libraries (lib/)

#### 📄 lib/auth.ts
**Purpose**: NextAuth configuration  
**Defines**:
- Authentication providers
- JWT and session callbacks
- Pages configuration

#### 📄 lib/supabase/client.ts
**Purpose**: Supabase client creation  
**Exports**:
- createSupabaseClient (client-side)
- createSupabaseAdmin (server-side)
- Database type definitions

#### 📄 lib/utils/geolocation.ts
**Purpose**: Geolocation utilities  
**Functions**:
- getCurrentLocation()
- calculateDistance() (Haversine)
- isGeolocationAvailable()
- formatDistance()

#### 📄 lib/utils/otp.ts
**Purpose**: OTP utilities  
**Functions**:
- generateOTP()
- calculateExpiryTime()
- isOTPExpired()
- getRemainingTime()
- formatRemainingTime()

#### 📄 lib/utils/export.ts
**Purpose**: Export utilities  
**Functions**:
- exportToExcel()
- exportToPDF()
- formatDateForExport()
- formatTimeForExport()

---

### Types (types/)

#### 📄 types/next-auth.d.ts
**Purpose**: NextAuth type extensions  
**Extends**:
- User interface (add role, regNo, year, semester)
- Session interface
- JWT interface

---

### Documentation Files

#### 📄 README.md
**Purpose**: Main project documentation  
**Sections**: Features, setup, structure, deployment

#### 📄 QUICKSTART.md
**Purpose**: Quick setup guide  
**Time**: ~10 minutes to complete

#### 📄 CONFIGURATION.md
**Purpose**: Detailed configuration guide  
**Covers**: All customization options

#### 📄 API.md
**Purpose**: API endpoint documentation  
**Details**: Request/response formats, errors

#### 📄 DEPLOYMENT.md
**Purpose**: Production deployment guide  
**Platforms**: Vercel, Railway, Netlify, self-hosted

#### 📄 PROJECT_SUMMARY.md
**Purpose**: Project overview  
**Content**: Features, architecture, status

#### 📄 CHANGELOG.md
**Purpose**: Version history  
**Format**: Keep a Changelog

#### 📄 FILE_STRUCTURE.md
**Purpose**: This file  
**Content**: Complete file descriptions

---

## File Count Summary

- **Total Files**: ~40 (excluding node_modules)
- **TypeScript Files**: 28
- **Documentation**: 8
- **Configuration**: 5
- **Database**: 1
- **CSS**: 2 (app/globals.css, src/app/globals.css)

---

## Key File Relationships

```
User Request
    ↓
middleware.ts (Auth Check)
    ↓
app/*/page.tsx (Page Component)
    ↓
components/* (UI Components)
    ↓
lib/utils/* (Utility Functions)
    ↓
app/api/*/route.ts (API Handler)
    ↓
lib/supabase/client.ts (Database Client)
    ↓
Supabase Database (schema.sql)
```

---

## Code Organization Principles

1. **Separation of Concerns**
   - API routes in app/api/
   - UI components in components/
   - Utilities in lib/utils/
   - Configuration in config/

2. **Type Safety**
   - All TypeScript
   - Type definitions in types/
   - Database types in lib/supabase/

3. **Reusability**
   - Utility functions
   - Shared components
   - Centralized configuration

4. **Security**
   - Environment variables
   - RLS policies in schema
   - Protected API routes
   - Middleware protection

---

## Files to Customize

For your specific use case:

1. **config/app.config.ts**: Academic settings
2. **database/schema.sql**: Database structure
3. **app/globals.css**: Theme colors
4. **.env.local**: Environment variables
5. **components/navbar.tsx**: Navigation items

---

**Last Updated**: 2025-10-01  
**Version**: 1.0.0
