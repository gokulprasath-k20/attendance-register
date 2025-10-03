import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/client';
import { calculateDistance } from '@/lib/utils/geolocation';
import { isOTPExpired } from '@/lib/utils/otp';
import { ATTENDANCE_CONFIG } from '@/config/app.config';
import { logError, handleApiError } from '@/lib/utils/error-handler';

export async function POST(request: NextRequest) {
  let session: any = null;
  
  try {
    session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { otpCode, latitude, longitude, selectedSubject } = body;

    if (!otpCode || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!selectedSubject) {
      return NextResponse.json(
        { error: 'Please select a subject before marking attendance' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Get OTP session
    const { data: otpSession, error: otpError } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('otp_code', otpCode)
      .single();

    if (otpError || !otpSession) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // Type assertion for otpSession
    const session_data = otpSession as any;

    // Check if OTP is expired
    if (isOTPExpired(session_data.expires_at)) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Validate that selected subject matches the OTP session subject
    if (session_data.subject !== selectedSubject) {
      return NextResponse.json(
        { 
          error: `Subject mismatch! This OTP is for "${session_data.subject}", but you selected "${selectedSubject}". Please select the correct subject.` 
        },
        { status: 400 }
      );
    }

    // Get student profile to verify year/semester match
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('year, semester')
      .eq('user_id', session.user.id)
      .single();

    const student_data = studentProfile as any;

    if (student_data && (
      student_data.year !== session_data.year || 
      student_data.semester !== session_data.semester
    )) {
      return NextResponse.json(
        { 
          error: `This OTP is for Year ${session_data.year} - Semester ${session_data.semester}, but you are in Year ${student_data.year} - Semester ${student_data.semester}` 
        },
        { status: 400 }
      );
    }

    // Check if student already marked attendance for this session
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('otp_session_id', session_data.id)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for this session' },
        { status: 400 }
      );
    }

    // Calculate distance
    console.log('=== DISTANCE CALCULATION DEBUG ===');
    console.log('Student coords:', { lat: latitude, lng: longitude });
    console.log('Staff coords:', { lat: session_data.admin_lat, lng: session_data.admin_lng });
    
    const distance = calculateDistance(
      latitude,
      longitude,
      session_data.admin_lat,
      session_data.admin_lng
    );
    
    console.log('Calculated distance:', distance, 'meters');
    console.log('Max allowed distance (10m rule):', ATTENDANCE_CONFIG.MAX_DISTANCE_METERS, 'meters');
    console.log('Within 10m radius:', distance <= ATTENDANCE_CONFIG.MAX_DISTANCE_METERS);
    console.log('=== END DEBUG ===');

    // Determine status - STRICT 10-meter rule (exactly 10.0m or less)
    // Round distance to 1 decimal place for precise comparison
    const roundedDistance = Math.round(distance * 10) / 10;
    const status =
      roundedDistance <= ATTENDANCE_CONFIG.MAX_DISTANCE_METERS
        ? ATTENDANCE_CONFIG.STATUS.PRESENT
        : ATTENDANCE_CONFIG.STATUS.ABSENT;
    
    console.log('Distance validation:');
    console.log('  Raw distance:', distance.toFixed(6), 'meters');
    console.log('  Rounded distance:', roundedDistance, 'meters');
    console.log('  Max allowed:', ATTENDANCE_CONFIG.MAX_DISTANCE_METERS, 'meters');
    console.log('  Status:', status === 'P' ? 'PRESENT' : 'ABSENT');
    console.log('  Rule: Distance must be ≤ 10.0m (10.1m = ABSENT)');

    // Mark attendance
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        student_id: session.user.id,
        otp_session_id: session_data.id,
        student_lat: latitude,
        student_lng: longitude,
        distance_meters: distance,
        status,
      } as any)
      .select()
      .single();

    if (attendanceError || !attendance) {
      console.error('Attendance creation error:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to mark attendance' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Attendance marked successfully',
        attendance: {
          ...(attendance as any),
          subject: session_data.subject,
          distance,
          status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 'VERIFY_OTP_API', session?.user?.id);
    const errorMessage = handleApiError(error, 'VERIFY_OTP');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
