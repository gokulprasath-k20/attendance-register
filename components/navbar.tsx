'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { NAVIGATION_MENU } from '@/config/app.config';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const menuItems = session.user.role
    ? NAVIGATION_MENU[session.user.role as keyof typeof NAVIGATION_MENU]
    : [];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
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
          <div className="flex items-center space-x-3 absolute left-1/2 transform -translate-x-1/2">
            <Image
              src="https://avsec-it.vercel.app/logo.png"
              alt="AVS Engineering College"
              width={180}
              height={60}
              className="h-12 sm:h-16 w-auto"
              priority
            />
            <div className="border-l border-gray-300 h-8 sm:h-12"></div>
            <div className="text-center hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-gray-800">Attendance System</h1>
              <p className="text-xs text-gray-600">Department of Information Technology</p>
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
              onClick={() => signOut()}
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
