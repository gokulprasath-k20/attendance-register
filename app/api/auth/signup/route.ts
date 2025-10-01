import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, regNo, year, semester, subjects } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate student-specific fields
    if (role === 'student' && (!regNo || !year || !semester)) {
      return NextResponse.json(
        { error: 'Students must provide registration number, year, and semester' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Create user in Supabase Auth with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for signup
    });

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      email,
      name,
      role,
      reg_no: role === 'student' ? regNo : null,
      year: role === 'student' ? parseInt(year) : null,
      semester: role === 'student' ? parseInt(semester) : null,
      subjects: role === 'staff' ? subjects : null,
    } as any);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User created successfully', user: authData.user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
