import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const subject = searchParams.get('subject');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    const supabase = createSupabaseAdmin();

    let query = supabase
      .from('attendance')
      .select(`
        *,
        profiles!student_id (
          name,
          email,
          reg_no,
          year,
          semester
        ),
        otp_sessions!otp_session_id (
          subject,
          year,
          semester,
          created_at
        )
      `);

    // Apply role-based filtering
    if (session.user.role === 'student') {
      query = query.eq('student_id', session.user.id);
    } else if (session.user.role === 'staff') {
      // Staff can only see students from years 2-4
      query = query.in('profiles.year', [2, 3, 4]);
    }

    // Apply filters
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Attendance fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch attendance' },
        { status: 500 }
      );
    }

    // Filter by subject, year, semester if provided
    let filteredData = data || [];

    if (subject) {
      filteredData = filteredData.filter(
        (record: any) => record.otp_sessions?.subject === subject
      );
    }

    if (year) {
      filteredData = filteredData.filter(
        (record: any) => record.otp_sessions?.year === parseInt(year)
      );
    }

    if (semester) {
      filteredData = filteredData.filter(
        (record: any) => record.otp_sessions?.semester === parseInt(semester)
      );
    }

    return NextResponse.json({ attendance: filteredData }, { status: 200 });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
