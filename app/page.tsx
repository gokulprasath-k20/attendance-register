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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in">
            {/* Logo/Brand */}
            <div className="flex justify-center mb-8">
              <div className="bg-primary-600 p-4 rounded-2xl shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H19V9Z"/>
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
              Smart Attendance
              <span className="block text-primary-600">Management System</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-secondary-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced geolocation-based attendance tracking with secure OTP verification. 
              Streamline your institution's attendance management with cutting-edge technology.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
              <div className="text-center animate-slide-up">
                <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-2">Geolocation Tracking</h3>
                <p className="text-secondary-600">Precise location-based attendance verification</p>
              </div>
              
              <div className="text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="bg-success-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-2">OTP Verification</h3>
                <p className="text-secondary-600">Secure one-time password authentication</p>
              </div>
              
              <div className="text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="bg-warning-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-warning-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,3H21A1,1 0 0,1 22,4V20A1,1 0 0,1 21,21H3A1,1 0 0,1 2,20V4A1,1 0 0,1 3,3M4,5V19H20V5H4M6,7H18V9H6V7M6,11H18V13H6V11M6,15H18V17H6V15Z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-2">Real-time Reports</h3>
                <p className="text-secondary-600">Comprehensive attendance analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Portals Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Access Your Portal</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Choose your role to access the appropriate dashboard and features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Student Portal */}
            <div className="card animate-scale-in group">
              <div className="card-body text-center">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl mb-6 mx-auto w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">Student Portal</h3>
                <p className="text-secondary-600 mb-8 leading-relaxed">
                  Mark your attendance, view attendance history, and track your academic progress
                </p>
                <div className="space-y-3">
                  <Link href="/auth/student/signin" className="btn-primary w-full block text-center">
                    Sign In
                  </Link>
                  <Link href="/auth/student/signup" className="btn-outline w-full block text-center">
                    Register
                  </Link>
                </div>
              </div>
            </div>

            {/* Staff Portal */}
            <div className="card animate-scale-in group" style={{animationDelay: '0.1s'}}>
              <div className="card-body text-center">
                <div className="bg-gradient-to-br from-success-500 to-success-600 p-6 rounded-2xl mb-6 mx-auto w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,4C16.88,4 17.67,4.84 17.67,5.84C17.67,6.84 16.88,7.68 16,7.68C15.12,7.68 14.33,6.84 14.33,5.84C14.33,4.84 15.12,4 16,4M16,8.86C18.03,8.86 19.67,10.5 19.67,12.53C19.67,14.56 18.03,16.2 16,16.2A3.67,3.67 0 0,1 12.33,12.53C12.33,10.5 13.97,8.86 16,8.86M16.5,21H15.5L15,19H17L16.5,21M20.5,19H22V21H20.5V19M9.5,12H11V21H9.5V12M2,11H6.5C7.06,11 7.5,11.44 7.5,12V21H6V12.5H5V21H3.5V12.5H2.5V21H1V12C1,11.44 1.44,11 2,11Z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">Staff Portal</h3>
                <p className="text-secondary-600 mb-8 leading-relaxed">
                  Generate OTP codes, manage classes, and monitor student attendance records
                </p>
                <div className="space-y-3">
                  <Link href="/auth/staff/signin" className="btn-primary w-full block text-center">
                    Sign In
                  </Link>
                  <Link href="/auth/staff/signup" className="btn-outline w-full block text-center">
                    Register
                  </Link>
                </div>
              </div>
            </div>

            {/* Admin Portal */}
            <div className="card animate-scale-in group" style={{animationDelay: '0.2s'}}>
              <div className="card-body text-center">
                <div className="bg-gradient-to-br from-warning-500 to-warning-600 p-6 rounded-2xl mb-6 mx-auto w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M21,16V14.5C21,13.96 20.75,13.5 20.35,13.24L19,12.5V11.5L20.35,10.76C20.75,10.5 21,10.04 21,9.5V8C21,7.45 20.55,7 20,7H4C3.45,7 3,7.45 3,8V9.5C3,10.04 3.25,10.5 3.65,10.76L5,11.5V12.5L3.65,13.24C3.25,13.5 3,13.96 3,14.5V16C3,16.55 3.45,17 4,17H20C20.55,17 21,16.55 21,16Z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">Admin Portal</h3>
                <p className="text-secondary-600 mb-8 leading-relaxed">
                  Comprehensive system management, user administration, and detailed analytics
                </p>
                <div className="space-y-3">
                  <Link href="/auth/admin/signin" className="btn-primary w-full block text-center">
                    Sign In
                  </Link>
                  <Link href="/auth/admin/signup" className="btn-outline w-full block text-center">
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H19V9Z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Smart Attendance Management</h3>
            <p className="text-secondary-300 mb-8 max-w-2xl mx-auto">
              Revolutionizing attendance tracking with modern technology and user-friendly interfaces.
            </p>
            <div className="border-t border-secondary-700 pt-8">
              <p className="text-secondary-400">
                © 2024 Smart Attendance Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
