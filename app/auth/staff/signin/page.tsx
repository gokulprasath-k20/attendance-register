'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
      // Add timeout to signIn call
      const signInPromise = signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignIn timeout')), 15000)
      );
      
      const result = await Promise.race([signInPromise, timeoutPromise]) as any;

      if (result?.error) {
        showToast('Invalid credentials', 'error');
        setIsLoading(false);
        return;
      }

      // Verify staff role after signin
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/auth/session', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const session = await response.json();
      
      if (session?.user?.role !== 'staff') {
        const userRole = session?.user?.role || 'unknown';
        showToast(`Access denied. This account is registered as '${userRole}'. Please use the correct signin page or contact admin if this is incorrect.`, 'error');
        await signOut({ redirect: false }); // Sign out
        setIsLoading(false);
        return;
      }

      showToast('Signed in successfully!', 'success');
      router.push('/staff/dashboard');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        showToast('Session check timed out. Please try again.', 'error');
      } else if (error.message === 'SignIn timeout') {
        showToast('Sign in timed out. Please check your connection and try again.', 'error');
      } else {
        showToast('An error occurred during sign in', 'error');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="https://avsec-it.vercel.app/logo.png"
              alt="AVS Engineering College"
              width={200}
              height={60}
              className="h-16 w-auto mx-auto mb-4"
              priority
            />
            <h3 className="text-lg font-semibold text-gray-800">Department of Information Technology</h3>
          </div>
          <div className="text-4xl mb-4">👨‍🏫</div>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B44F7] focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B44F7] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8B44F7] text-white py-3 rounded-lg font-medium hover:bg-[#7c3aed] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In as Staff'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/staff/signup" className="text-[#8B44F7] hover:text-[#7c3aed] font-medium">
              Register
            </Link>
          </p>
          <Link href="/" className="block text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
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
