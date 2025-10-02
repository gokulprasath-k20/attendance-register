import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admins to update user roles
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { email, newRole, regNo, year, semester } = body;

    if (!email || !newRole) {
      return NextResponse.json({ 
        error: 'Email and newRole are required' 
      }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'staff', 'student'].includes(newRole)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be admin, staff, or student' 
      }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // Prepare update data
    const updateData: any = { role: newRole };
    
    // Add student-specific fields if role is student
    if (newRole === 'student') {
      if (regNo) updateData.reg_no = regNo;
      if (year) updateData.year = year;
      if (semester) updateData.semester = semester;
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData as any)
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update user role',
        details: updateError.message 
      }, { status: 500 });
    }

    const profileData = updatedProfile as any;

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        email: profileData.email,
        name: profileData.name,
        role: profileData.role,
        regNo: profileData.reg_no,
        year: profileData.year,
        semester: profileData.semester
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
