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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Admin Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border-2 border-purple-200 hover:border-purple-400">
                <div className="text-5xl mb-3">👨‍💼</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Admin</h4>
                <p className="text-gray-600 text-sm mb-4">View & manage attendance</p>
                <div className="space-y-2">
                  <Link
                    href="/auth/admin/signin"
                    className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/admin/signup"
                    className="block w-full bg-white text-purple-600 px-4 py-2 rounded-lg font-medium border-2 border-purple-600 hover:bg-purple-50 transition-all"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* Staff Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border-2 border-indigo-200 hover:border-indigo-400">
                <div className="text-5xl mb-3">👨‍🏫</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Staff</h4>
                <p className="text-gray-600 text-sm mb-4">Generate OTPs & view records</p>
                <div className="space-y-2">
                  <Link
                    href="/auth/staff/signin"
                    className="block w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/staff/signup"
                    className="block w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium border-2 border-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* Student Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border-2 border-teal-200 hover:border-teal-400">
                <div className="text-5xl mb-3">🎓</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Student</h4>
                <p className="text-gray-600 text-sm mb-4">Mark attendance & view history</p>
                <div className="space-y-2">
                  <Link
                    href="/auth/student/signin"
                    className="block w-full bg-gradient-to-r from-teal-600 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/student/signup"
                    className="block w-full bg-white text-teal-600 px-4 py-2 rounded-lg font-medium border-2 border-teal-600 hover:bg-teal-50 transition-all"
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

          {/* Roles Section */}
          <div className="mt-16 bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Three User Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <h3 className="text-xl font-bold text-purple-700 mb-2">Admin</h3>
                <ul className="text-gray-700 space-y-1 text-left">
                  <li>• Generate OTPs</li>
                  <li>• View all attendance</li>
                  <li>• Manage users</li>
                  <li>• Export reports</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <h3 className="text-xl font-bold text-indigo-700 mb-2">Staff</h3>
                <ul className="text-gray-700 space-y-1 text-left">
                  <li>• Generate OTPs</li>
                  <li>• View student attendance</li>
                  <li>• Export reports</li>
                  <li>• Track sessions</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <h3 className="text-xl font-bold text-pink-700 mb-2">Student</h3>
                <ul className="text-gray-700 space-y-1 text-left">
                  <li>• Mark attendance</li>
                  <li>• Enter OTP codes</li>
                  <li>• View attendance history</li>
                  <li>• Check status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
