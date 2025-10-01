'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';

export default function StaffSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        showToast('Invalid credentials', 'error');
        setIsLoading(false);
        return;
      }

      // Verify staff role after signin
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      if (session?.user?.role !== 'staff') {
        showToast('Access denied. Staff credentials required.', 'error');
        setIsLoading(false);
        return;
      }

      showToast('Signed in successfully!', 'success');
      router.push('/staff');
    } catch (error) {
      showToast('An error occurred', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👨‍🏫</div>
          <h2 className="text-3xl font-bold text-gray-900">Staff Sign In</h2>
          <p className="text-gray-600 mt-2">Access the staff dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Staff Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="staff@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In as Staff'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/staff/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Register
            </Link>
          </p>
          <Link href="/" className="block text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">Sign in as:</p>
          <div className="flex gap-2 mt-3 justify-center">
            <Link
              href="/auth/admin/signin"
              className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/auth/student/signin"
              className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
