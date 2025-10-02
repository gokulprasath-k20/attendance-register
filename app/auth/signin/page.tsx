'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast, showToast, closeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        showToast('Invalid credentials', 'error');
      } else {
        showToast('Signed in successfully!', 'success');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Attendance Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B44F7] focus:border-[#8B44F7] sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B44F7] focus:border-[#8B44F7] sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#8B44F7] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B44F7] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Don&apos;t have an account?</p>
            <div className="flex flex-col space-y-2">
              <Link
                href="/auth/student/signup"
                className="text-[#8B44F7] hover:text-[#7c3aed] font-medium text-sm"
              >
                Sign up as Student
              </Link>
              <Link
                href="/auth/staff/signup"
                className="text-[#8B44F7] hover:text-[#7c3aed] font-medium text-sm"
              >
                Sign up as Staff
              </Link>
              <Link
                href="/auth/admin/signup"
                className="text-[#8B44F7] hover:text-[#7c3aed] font-medium text-sm"
              >
                Sign up as Admin
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
