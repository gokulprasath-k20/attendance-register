'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { NAVIGATION_MENU, ROUTES } from '@/config/app.config';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const menuItems = session.user.role
    ? NAVIGATION_MENU[session.user.role as keyof typeof NAVIGATION_MENU]
    : [];

  const handleSignOut = () => {
    // Get role-specific sign-in URL
    const getSignInUrl = (role: string) => {
      switch (role) {
        case 'admin':
          return ROUTES.ADMIN_SIGNIN;
        case 'staff':
          return ROUTES.STAFF_SIGNIN;
        case 'student':
          return ROUTES.STUDENT_SIGNIN;
        default:
          return ROUTES.HOME;
      }
    };

    const callbackUrl = getSignInUrl(session.user.role);
    signOut({ callbackUrl });
  };

  return (
    <nav className="bg-gradient-to-r from-gray-50 to-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-24">
          {/* Left side - Navigation Menu */}
          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:bg-purple-50 hover:text-[#9B7EBD] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Center - Logo */}
          <div className="flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
            {/* College Logo */}
            <div className="flex items-center space-x-3 mb-2">
              <Image
                src="https://avsec-it.vercel.app/logo.png"
                alt="AVS Engineering College"
                width={200}
                height={60}
                className="h-12 sm:h-16 w-auto"
                priority
              />
            </div>
            
            {/* Department Name */}
            <div className="text-center">
              <h1 className="text-base sm:text-lg font-semibold text-gray-800 tracking-wide">Department of Information Technology</h1>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">Attendance Management System</p>
            </div>
          </div>

          {/* Right side - User Info & Sign Out */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-sm font-medium">{session.user.name}</span>
              <span className="text-xs bg-[#9B7EBD] text-white px-3 py-1 rounded-full">
                {session.user.role}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
