'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { NAVIGATION_MENU, USER_ROLES } from '@/config/app.config';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const menuItems = session.user.role
    ? NAVIGATION_MENU[session.user.role as keyof typeof NAVIGATION_MENU]
    : [];

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold">
              Attendance System
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}

            <div className="flex items-center space-x-2 text-white">
              <span className="text-sm">{session.user.name}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {session.user.role}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
