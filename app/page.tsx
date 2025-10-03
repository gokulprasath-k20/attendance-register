'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      // Redirect to appropriate dashboard
      switch (session.user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'staff':
          router.push('/staff/dashboard');
          break;
        case 'student':
          router.push('/student');
          break;
        default:
          break;
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Attendance Management System
          </h1>

          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Portal</h3>
            <div className="max-w-md mx-auto">
              {/* Student Card */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-purple-200 hover:border-[#8B44F7]">
                <div className="text-6xl mb-4">🎓</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Student</h4>
                <p className="text-gray-600 mb-6">Mark attendance & view history</p>
                <div className="space-y-3">
                  <Link
                    href="/auth/student/signin"
                    className="block w-full bg-[#8B44F7] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7c3aed] transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/student/signup"
                    className="block w-full bg-white text-[#8B44F7] px-6 py-3 rounded-lg font-medium border-2 border-[#8B44F7] hover:bg-purple-50 transition-all"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
