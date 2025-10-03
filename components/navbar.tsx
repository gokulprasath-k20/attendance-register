'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Left side - Navigation Menu */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:bg-purple-50 hover:text-[#9B7EBD] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
              >
                <span className="hidden sm:inline">{item.name}</span>
                <span className="sm:hidden">
                  {item.name.includes('Dashboard') ? 'Home' : 
                   item.name.includes('User') ? 'Users' :
                   item.name.includes('Attendance') ? 'Records' :
                   item.name.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>

          {/* Center - App Title */}
          <div className="flex flex-col items-center absolute left-1/2 transform -translate-x-1/2 hidden md:flex">
            <div className="text-center">
              <h1 className="text-xs sm:text-sm font-medium text-gray-800 tracking-wide">Attendance Management System</h1>
            </div>
          </div>

          {/* Mobile App Title - Simplified */}
          <div className="flex items-center md:hidden absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-sm font-semibold text-gray-800">AMS</h1>
          </div>

          {/* Right side - User Info & Sign Out */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-700">
              <span className="text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-none">{session.user.name}</span>
              <span className="text-xs bg-[#9B7EBD] text-white px-2 sm:px-3 py-1 rounded-full">
                {session.user.role}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
