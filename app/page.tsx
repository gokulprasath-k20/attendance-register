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
          router.push('/admin');
          break;
        case 'staff':
          router.push('/staff');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Attendance Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Geolocation-based attendance tracking with OTP verification
          </p>

          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Portal</h3>
            <div className="max-w-md mx-auto">
              {/* Student Card */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-teal-200 hover:border-teal-400">
                <div className="text-6xl mb-4">🎓</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Student</h4>
                <p className="text-gray-600 mb-6">Mark attendance & view history</p>
                <div className="space-y-3">
                  <Link
                    href="/auth/student/signin"
                    className="block w-full bg-gradient-to-r from-teal-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/student/signup"
                    className="block w-full bg-white text-teal-600 px-6 py-3 rounded-lg font-medium border-2 border-teal-600 hover:bg-teal-50 transition-all"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Geolocation Verification
              </h3>
              <p className="text-gray-600">
                Accurate attendance tracking using GPS location verification
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                OTP-Based System
              </h3>
              <p className="text-gray-600">
                Secure time-limited OTP codes for attendance marking
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Comprehensive Reports
              </h3>
              <p className="text-gray-600">
                Export attendance data to Excel and PDF formats
              </p>
            </div>
          </div>

          {/* Student Features */}
          <div className="mt-16 bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Student Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-6 bg-gradient-to-br from-teal-50 to-green-50 rounded-lg">
                <h3 className="text-xl font-bold text-teal-700 mb-3">📱 Easy Attendance</h3>
                <ul className="text-gray-700 space-y-2 text-left">
                  <li>• Mark attendance with OTP</li>
                  <li>• GPS-based verification</li>
                  <li>• Real-time status updates</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-teal-50 to-green-50 rounded-lg">
                <h3 className="text-xl font-bold text-teal-700 mb-3">📊 Track Progress</h3>
                <ul className="text-gray-700 space-y-2 text-left">
                  <li>• View attendance history</li>
                  <li>• Check attendance status</li>
                  <li>• Monitor your records</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
