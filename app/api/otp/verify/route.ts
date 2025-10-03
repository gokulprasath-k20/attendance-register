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
    const { otpCode, latitude, longitude, selectedSubject, accuracy } = body;

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

    // Calculate distance with GPS accuracy analysis
    console.log('=== ENHANCED DISTANCE CALCULATION FOR NEARBY DEVICES ===');
    console.log('Student coords:', { lat: latitude, lng: longitude, accuracy: accuracy || 'unknown' });
    console.log('Staff coords:', { lat: session_data.admin_lat, lng: session_data.admin_lng });
    
    // GPS accuracy analysis for nearby device detection
    if (accuracy) {
      console.log('GPS Accuracy Analysis:');
      if (accuracy <= 5) {
        console.log('  ✅ EXCELLENT GPS accuracy - reliable for nearby device detection');
      } else if (accuracy <= 10) {
        console.log('  ✅ GOOD GPS accuracy - suitable for nearby device detection');
      } else if (accuracy <= 20) {
        console.log('  ⚠️ MODERATE GPS accuracy - may affect nearby device detection');
      } else {
        console.log('  ❌ POOR GPS accuracy - nearby device detection unreliable');
      }
    }
    
    const distance = calculateDistance(
      session_data.admin_lat,
      session_data.admin_lng,
      latitude,
      longitude
    );
    
    console.log('Final Results:');
    console.log('  Calculated distance:', distance, 'meters');
    console.log('  Max allowed (5m rule):', ATTENDANCE_CONFIG.MAX_DISTANCE_METERS, 'meters');
    console.log('  Within range:', distance <= ATTENDANCE_CONFIG.MAX_DISTANCE_METERS);
    console.log('=== END ENHANCED DEBUG ===');

    // EXACT DISTANCE VALIDATION FOR FINAL YEAR PROJECT
    // No GPS compensation - use exact calculated distance
    const preciseDistance = Math.round(distance * 1000) / 1000; // Millimeter precision
    
    // Strict 10-meter rule - exactly as calculated
    const status = preciseDistance <= ATTENDANCE_CONFIG.MAX_DISTANCE_METERS
      ? ATTENDANCE_CONFIG.STATUS.PRESENT
      : ATTENDANCE_CONFIG.STATUS.ABSENT;
    
    console.log('EXACT DISTANCE VALIDATION (Final Year Project):');
    console.log('  Raw calculated distance:', distance.toFixed(10), 'meters');
    console.log('  Precise distance (3 decimals):', preciseDistance, 'meters');
    console.log('  GPS accuracy reported:', accuracy ? `${accuracy}m` : 'unknown');
    console.log('  Maximum allowed distance:', ATTENDANCE_CONFIG.MAX_DISTANCE_METERS, 'meters');
    console.log('  Final status:', status === 'P' ? 'PRESENT' : 'ABSENT');
    console.log('  Validation rule: EXACT distance ≤ 5.000m = PRESENT');
    console.log('  No GPS compensation applied - showing true calculated distance');

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
