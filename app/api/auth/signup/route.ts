import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

    console.log('Creating user with email:', email, 'role:', role);

    // Verify env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Use anon key for signup
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Create user with anon key
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        }
      }
    });

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    console.log('User created successfully, creating profile...');

    // Use admin client for profile creation (bypass RLS)
    const supabaseAdmin = createSupabaseAdmin();

    // Create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
