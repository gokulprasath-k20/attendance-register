import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      api: true,
    },
    errors: [] as string[],
  };

  try {
    // Test database connection
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      healthCheck.checks.database = false;
      healthCheck.errors.push(`Database error: ${error.message}`);
    } else {
      healthCheck.checks.database = true;
    }
  } catch (error) {
    healthCheck.checks.database = false;
    healthCheck.errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Determine overall status
  const failedChecks = Object.values(healthCheck.checks).filter(check => !check).length;
  const totalChecks = Object.keys(healthCheck.checks).length;

  if (failedChecks === 0) {
    healthCheck.status = 'healthy';
  } else if (failedChecks < totalChecks) {
    healthCheck.status = 'degraded';
  } else {
    healthCheck.status = 'unhealthy';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthCheck, { status: statusCode });
}
