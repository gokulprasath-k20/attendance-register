'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { NAVIGATION_MENU, ROUTES } from '@/config/app.config';
import DepartmentHeader from './department-header';

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
    <>
      <nav className="bg-gradient-to-r from-gray-50 to-white shadow-lg border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            {/* Center - Logo */}
            <Image
              src="/logo (1).png"
              alt="Logo"
              width={800}
              height={200}
              className="h-16 w-auto"
              priority
            />
          </div>
        </div>
      </nav>
      <DepartmentHeader />
    </>
  );
}
