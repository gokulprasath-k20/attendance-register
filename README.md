# Attendance Management System

A modern, production-ready web application for managing student attendance with geolocation verification using Next.js 15 and Supabase.

## 🌟 Features

- **Geolocation-Based Attendance**: Automatic distance calculation using Haversine formula
- **OTP System**: Time-limited OTP codes for secure attendance marking
- **Role-Based Access Control**: Three user roles (Admin, Staff, Student)
- **Real-time Tracking**: Live attendance monitoring and status updates
- **Export Functionality**: Export to Excel and PDF with formatted reports
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Secure Authentication**: NextAuth.js with Supabase backend

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 (Lavender theme)
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: TanStack Query (React Query)
- **Authentication**: NextAuth.js
- **Export**: ExcelJS, jsPDF
- **Geolocation**: HTML5 Geolocation API

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/gokulprasath-k20/attendance-register.git
cd attendance-register
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Navigate to SQL Editor and run the schema from `database/schema.sql`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Optional Configuration (with defaults)
NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE=10
NEXT_PUBLIC_OTP_EXPIRY_MINUTES=5
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Run Database Migrations

Execute the SQL schema in your Supabase project:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents from `database/schema.sql`
3. Click "Run" to execute

### 6. Create First Admin User

After running the database schema:
1. Sign up through the application
2. In Supabase Dashboard, go to Authentication → Users
3. Copy the User ID
4. Run in SQL Editor:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'your-user-id-here';
```

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
avsecitar/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── staff/             # Staff dashboard
│   ├── student/           # Student dashboard
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── navbar.tsx
│   ├── loading-spinner.tsx
│   └── toast.tsx
├── config/               # Configuration
│   └── app.config.ts     # Centralized config
├── database/             # Database schema
│   └── schema.sql
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth config
│   ├── supabase/        # Supabase clients
│   └── utils/           # Utility functions
├── types/               # TypeScript types
└── middleware.ts        # Route protection

```

## 👥 User Roles

### Admin
- View all attendance records (all years)
- Export reports to Excel/PDF
- Monitor system-wide attendance
- **Independent registration** (no user management)

### Staff
- **Register independently** with subjects
- Generate OTPs for attendance sessions
- View attendance for students in years 2-4
- Export reports to Excel/PDF
- Monitor attendance sessions

### Student
- **Register independently** with reg no, year, semester
- Mark attendance using OTP codes
- View personal attendance history
- Check attendance status
- See distance from attendance location

## 🔐 Security Features

- **Row Level Security (RLS)**: Supabase RLS policies on all tables
- **Role-Based Access**: Middleware protection for routes
- **Secure Authentication**: NextAuth.js with JWT tokens
- **Environment Variables**: Sensitive data in environment variables
- **Service Role Protection**: Admin operations use service role key

## 📊 Attendance System

### How It Works

1. **Admin/Staff generates OTP**:
   - Captures their geolocation
   - Sets subject, year, and semester
   - OTP valid for 5 minutes (configurable)

2. **Student marks attendance**:
   - Enters OTP code
   - System captures student's location
   - Calculates distance using Haversine formula
   - Auto-determines status:
     - **Present (P)**: Within 10 meters (configurable)
     - **Absent (A)**: Beyond threshold

3. **Distance Calculation**:
   - Uses Haversine formula for accuracy
   - Accounts for Earth's curvature
   - Precision within 1 meter

## 📤 Export Features

### Excel Export
- Formatted spreadsheets with styling
- Color-coded status (green for Present, red for Absent)
- Includes all attendance metadata
- Automatic timestamp in filename

### PDF Export
- Professional layout with headers
- Summary statistics
- Color-coded attendance status
- Optimized for printing

## ⚙️ Configuration

All configuration is centralized in `config/app.config.ts`:

- **Attendance thresholds**: Distance limits
- **OTP settings**: Expiry time, code length
- **Academic config**: Years, semesters, subjects
- **Route mappings**: Protected routes
- **Query settings**: Cache times, refetch policies

## 🔄 API Endpoints

### Public
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Protected
- `POST /api/otp/generate` - Generate OTP (Staff only)
- `POST /api/otp/verify` - Mark attendance (Student)
- `GET /api/attendance` - Fetch attendance records (All roles)

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Role-based dashboard access
- [ ] OTP generation with geolocation
- [ ] Attendance marking within range
- [ ] Attendance marking outside range
- [ ] Distance calculation accuracy
- [ ] Export to Excel
- [ ] Export to PDF
- [ ] User management (Admin)
- [ ] Mobile responsiveness
- [ ] Error handling

## 🚢 Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- Supabase credentials
- NextAuth secret and URL
- Optional configuration values

## 📝 Configuration Details

See `CONFIGURATION.md` for detailed configuration options and customization guide.

## 🐛 Troubleshooting

### Common Issues

**Location permission denied**
- Ensure HTTPS in production (browsers require secure context)
- Check browser location permissions

**OTP expired**
- Increase `NEXT_PUBLIC_OTP_EXPIRY_MINUTES`
- Check system time synchronization

**Distance calculation inaccurate**
- Verify GPS accuracy on device
- Check for indoor/underground locations
- Adjust `NEXT_PUBLIC_MAX_ATTENDANCE_DISTANCE`

**Database connection errors**
- Verify Supabase credentials
- Check RLS policies are enabled
- Ensure service role key is correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For issues and questions:
- Check the troubleshooting guide
- Review configuration documentation
- Open an issue on GitHub

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Attendance analytics dashboard
- [ ] QR code support
- [ ] Mobile app (React Native)
- [ ] Bulk operations
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Calendar integration

---

**Built with ❤️ using Next.js and Supabase**
