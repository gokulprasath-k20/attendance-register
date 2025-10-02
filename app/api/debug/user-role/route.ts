import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // Get user profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return NextResponse.json({ 
        error: 'User not found or database error',
        details: profileError.message 
      }, { status: 404 });
    }

    if (!profile) {
      return NextResponse.json({ 
        error: 'No profile found for this email',
        suggestion: 'User may need to complete signup process'
      }, { status: 404 });
    }

    const profileData = profile as any;
    
    return NextResponse.json({
      email: profileData.email,
      name: profileData.name,
      role: profileData.role,
      regNo: profileData.reg_no,
      year: profileData.year,
      semester: profileData.semester,
      created_at: profileData.created_at
    });

  } catch (error) {
    console.error('Debug user role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
