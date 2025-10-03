'use client';

import { useSession } from 'next-auth/react';

export default function UserInfo() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-end">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3">
            <div className="flex flex-col items-center text-gray-700">
              <span className="text-sm font-medium">{session.user.name}</span>
              <span className="text-xs text-gray-600 capitalize">{session.user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
