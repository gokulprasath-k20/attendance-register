import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/client';
import { generateOTP, calculateExpiryTime } from '@/lib/utils/otp';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude, subject, year, semester, period } = body;

    if (!latitude || !longitude || !subject || !year || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Generate unique OTP
    let otpCode = generateOTP();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('otp_sessions')
        .select('id')
        .eq('otp_code', otpCode)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        otpCode = generateOTP();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique OTP' },
        { status: 500 }
      );
    }

    // Create OTP session
    const insertData: any = {
      otp_code: otpCode,
      staff_id: session.user.id,
      admin_lat: latitude,
      admin_lng: longitude,
      subject,
      year: parseInt(year),
      semester: parseInt(semester),
      expires_at: calculateExpiryTime(),
    };

    // Add period if provided
    if (period) {
      insertData.period_number = parseInt(period);
    }

    const { data: otpSession, error } = await supabase
      .from('otp_sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('OTP creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create OTP session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ otpSession }, { status: 201 });
  } catch (error) {
    console.error('Generate OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
