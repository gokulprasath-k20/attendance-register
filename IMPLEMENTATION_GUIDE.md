# Staff and Student Panel Implementation Guide

## Overview
This implementation adds enhanced subject tracking, cascading dropdowns, and improved filtering to both Staff and Student panels.

## SQL Schema Changes

### Run This First
Execute the SQL file: `database/schema_updates_subject_tracking.sql`

This adds:
- **Period tracking** in OTP sessions (period_number, session_date)
- **Enhanced views** for active sessions and detailed history
- **Helper functions** for year/semester/subject management
- **Optimized indexes** for better performance

### Key SQL Functions

1. **get_subjects_for_year_semester(year, semester)** - Returns available subjects
2. **get_semesters_for_year(year)** - Returns available semesters
3. **get_filtered_attendance(...)** - Advanced attendance filtering
4. **active_otp_sessions view** - Shows only active, non-expired OTP sessions
5. **attendance_detailed_history view** - Comprehensive attendance data with joins

---

## Subject Mappings by Year and Semester

### 2nd Year
- **Semester 1 (3rd Semester):** DM, DPCO, DSA, FDS, OOPS
- **Semester 2 (4th Semester):** TOC, OS, DBMS, ESS, WE, AI & ML

### 3rd Year
- **Semester 1 (5th Semester):** FSWD, ES & IoT, STA, CC, DC, CN
- **Semester 2 (6th Semester):** Dummy Subject 1, 2, 3

### 4th Year
- **Semester 1 (7th Semester):** Dummy Subject 1, 2, 3
- **Semester 2 (8th Semester):** Dummy Subject 1, 2, 3

---

## Staff Panel Features

### Generate Attendance OTP
**Cascading Selection Flow:**
1. Select **Year** (2, 3, or 4)
2. Select **Semester** (1 or 2) - Shows appropriate semester label
3. Select **Subject** - Only shows subjects for selected year/semester
4. Select **Period** (Optional: 1-8)

**Validation:**
- Semester dropdown disabled until year is selected
- Subject dropdown disabled until both year and semester are selected
- Resetting year clears semester and subject
- Resetting semester clears subject

### Attendance History (Staff)
**Filters Available:**
- Year (All Years, Year 2, 3, 4)
- Semester (All Semesters, 1, 2)
- Status (All, Present Only, Absent Only)
- Start Date
- End Date

**Display:**
- Student Name
- Registration Number
- Subject
- Date (formatted)
- Time (formatted)
- Status (color-coded badges)

**Export Options:**
- Excel Export
- PDF Export

---

## Student Panel Features

### Mark Attendance
**Requirements:**
1. **Select Subject First** - Students must choose the subject for the current period
2. **Enter OTP** - 6-digit code from staff

**Display:**
- Shows student's Year and Semester
- Lists only subjects applicable to their year/semester
- Helpful hint text: "Select the subject that matches the current period"

**Validation:**
- Subject selection is required
- Subject must match the OTP session subject
- Year/Semester must match the OTP session
- Prevents duplicate attendance for same session
- Validates proximity to staff location

**Error Messages:**
- "Please select a subject before marking attendance"
- "Subject mismatch! This OTP is for [X], but you selected [Y]"
- "This OTP is for Year X - Semester Y, but you are in Year A - Semester B"
- "Attendance already marked for this session"

### Attendance History (Student)
**Filters Available:**
- Subject (Shows only their subjects)
- Status (All, Present Only, Absent Only)
- Start Date
- End Date

**Display:**
- Date (formatted)
- Time (formatted)
- Subject
- Status (color-coded badges)
- Distance from staff

---

## Technical Implementation

### New Files Created

1. **`database/schema_updates_subject_tracking.sql`**
   - Database schema updates
   - Views and functions

2. **`lib/utils/subjects.ts`**
   - `getSemestersForYear(year)` - Get available semesters
   - `getSubjectsForYearAndSemester(year, semester)` - Get subjects
   - `getAllSubjects()` - Get all unique subjects
   - `getSemesterLabel(year, semester)` - Display label (e.g., "Semester 3")
   - `isValidSubjectForYearSemester(subject, year, semester)` - Validation
   - `getYearLabel(year)` - Display label

3. **`app/api/auth/profile/route.ts`**
   - GET endpoint to fetch user profile
   - Returns student's year, semester, and other info

### Modified Files

1. **`config/app.config.ts`**
   - Added `SUBJECTS_BY_YEAR_SEMESTER` mapping
   - Added `ALL_SUBJECTS` array
   - Added `PERIODS` array (1-8)
   - Updated `YEARS` to [2, 3, 4]

2. **`app/staff/dashboard/page.tsx`**
   - Cascading dropdown logic with useEffect
   - Period selection
   - Enhanced history filters
   - Time display in history
   - Client-side filtering

3. **`app/student/page.tsx`**
   - Subject selection before OTP entry
   - Profile fetching to get year/semester
   - Subject validation
   - Enhanced history filters
   - Time display in history

4. **`app/api/otp/verify/route.ts`**
   - Subject validation (must match OTP)
   - Year/Semester validation
   - Enhanced error messages

5. **`app/api/otp/generate/route.ts`**
   - Period tracking support
   - Stores period_number if provided

6. **`app/auth/staff/signup/page.tsx`**
   - Updated to use `ALL_SUBJECTS`

---

## Usage Workflow

### Staff Workflow
1. Staff selects Year → Semester → Subject → (Optional) Period
2. Clicks "Generate OTP"
3. System generates 6-digit OTP
4. OTP displayed with expiry time
5. Staff shares OTP with students verbally or via projection
6. Students mark attendance using the OTP
7. Staff can view real-time attendance in history table
8. Staff can filter and export attendance records

### Student Workflow
1. Student logs in and sees their Year/Semester
2. When marking attendance:
   - Selects the subject for current period
   - Enters OTP from staff
   - Submits
3. System validates:
   - Subject matches OTP
   - Year/Semester matches OTP
   - Student hasn't already marked attendance
   - Student is within allowed distance
4. Attendance marked as Present (P) or Absent (A)
5. Student can view their attendance history with filters

---

## Validation Logic

### Subject Matching
```typescript
// Student's selected subject MUST match staff's OTP subject
if (otpSession.subject !== selectedSubject) {
  // Error: Subject mismatch
}
```

### Year/Semester Matching
```typescript
// Student's year/semester MUST match OTP year/semester
if (studentProfile.year !== otpSession.year || 
    studentProfile.semester !== otpSession.semester) {
  // Error: Wrong class
}
```

### Available Subjects Logic
```typescript
// Only show subjects for student's year/semester
const subjects = getSubjectsForYearAndSemester(
  studentProfile.year,
  studentProfile.semester
);
```

---

## Database Queries

### Get Active OTP Sessions
```sql
SELECT * FROM active_otp_sessions;
```

### Get Filtered Attendance
```sql
SELECT * FROM get_filtered_attendance(
  'student-uuid',
  'student',
  '2025-01-01'::DATE,
  '2025-12-31'::DATE,
  'FSWD',
  3,
  1,
  'P',
  NULL
);
```

### Get Subjects for Year/Semester
```sql
SELECT get_subjects_for_year_semester(2, 1);
-- Returns: {DM, DPCO, DSA, FDS, OOPS}
```

---

## Benefits

### For Staff
- ✅ Intuitive cascading selection prevents errors
- ✅ Only relevant subjects shown based on year/semester
- ✅ Period tracking for better record keeping
- ✅ Comprehensive filtering and export options
- ✅ Real-time attendance monitoring

### For Students
- ✅ Clear indication of required subject selection
- ✅ Only see subjects relevant to their class
- ✅ Better error messages guide correct usage
- ✅ Prevents wrong subject selection
- ✅ Enhanced history with detailed filters

### System Benefits
- ✅ Data integrity through validation
- ✅ Better organized attendance records
- ✅ Easier reporting and analytics
- ✅ Reduced manual errors
- ✅ Scalable for future additions

---

## Testing Checklist

### Staff Panel
- [ ] Select Year 2 → Only Semesters 1, 2 appear
- [ ] Select Semester 1 → Only 3rd semester subjects appear
- [ ] Change Year → Semester and Subject reset
- [ ] Change Semester → Subject resets
- [ ] Generate OTP with period → Period stored
- [ ] Filter by Year → Correct records shown
- [ ] Filter by Semester → Correct records shown
- [ ] Filter by Status → Only P or A shown
- [ ] Filter by Date Range → Correct dates shown
- [ ] Export Excel → File downloads
- [ ] Export PDF → File downloads

### Student Panel
- [ ] Profile loads with correct Year/Semester
- [ ] Subject dropdown shows only relevant subjects
- [ ] Submit without subject → Error shown
- [ ] Submit with wrong subject → Error shown
- [ ] Submit with correct subject → Attendance marked
- [ ] Filter by Subject → Correct records shown
- [ ] Filter by Status → Correct records shown
- [ ] Filter by Date → Correct records shown
- [ ] Time displayed correctly in history

---

## Troubleshooting

### Issue: Subjects not appearing in dropdown
**Solution:** Ensure year and semester are selected first (cascading logic)

### Issue: "Subject mismatch" error
**Solution:** Student must select the same subject that staff selected when generating OTP

### Issue: "Wrong class" error
**Solution:** Student's year/semester must match the OTP session year/semester

### Issue: Database errors after SQL update
**Solution:** Ensure `schema_updates_subject_tracking.sql` was run successfully

### Issue: TypeScript errors
**Solution:** Type assertions added using `as any` for Supabase responses

---

## Future Enhancements

- Add subject-wise attendance percentage
- Implement semester-wise report cards
- Add notifications for low attendance
- Create analytics dashboard
- Add bulk OTP generation for multiple periods
- Implement QR code alternative to OTP

---

## Support

For issues or questions:
1. Check this documentation
2. Review SQL schema comments
3. Check console logs for errors
4. Verify database schema is updated
5. Ensure all dependencies are installed
