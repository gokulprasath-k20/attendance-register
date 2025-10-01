import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/client';
import { calculateDistance } from '@/lib/utils/geolocation';
import { isOTPExpired } from '@/lib/utils/otp';
import { ATTENDANCE_CONFIG } from '@/config/app.config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { otpCode, latitude, longitude } = body;

    if (!otpCode || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if OTP is expired
    if (isOTPExpired(otpSession.expires_at)) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Check if student already marked attendance for this session
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('otp_session_id', otpSession.id)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for this session' },
        { status: 400 }
      );
    }

    // Calculate distance
    const distance = calculateDistance(
      latitude,
      longitude,
      otpSession.admin_lat,
      otpSession.admin_lng
    );

    // Determine status
    const status =
      distance <= ATTENDANCE_CONFIG.MAX_DISTANCE_METERS
        ? ATTENDANCE_CONFIG.STATUS.PRESENT
        : ATTENDANCE_CONFIG.STATUS.ABSENT;

    // Mark attendance
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        student_id: session.user.id,
        otp_session_id: otpSession.id,
        student_lat: latitude,
        student_lng: longitude,
        distance_meters: distance,
        status,
      } as any)
      .select()
      .single();

    if (attendanceError) {
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
          ...attendance,
          subject: otpSession.subject,
          distance,
          status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
