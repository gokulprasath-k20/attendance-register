'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { NAVIGATION_MENU } from '@/config/app.config';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const menuItems = session.user.role
    ? NAVIGATION_MENU[session.user.role as keyof typeof NAVIGATION_MENU]
    : [];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow-lg border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H19V9Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">Smart Attendance</h1>
                <p className="text-sm text-secondary-600">Management System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-secondary-700 hover:bg-primary-50 hover:text-primary-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}

            <div className="flex items-center space-x-4 pl-6 border-l border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">{session.user.name}</p>
                  <p className="text-xs text-secondary-600 capitalize">{session.user.role}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                  session.user.role === 'student' ? 'bg-primary-600' :
                  session.user.role === 'staff' ? 'bg-success-600' :
                  'bg-warning-600'
                }`}>
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
