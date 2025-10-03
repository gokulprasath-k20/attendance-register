'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import AuthNavbar from '@/components/auth-navbar';

export default function StudentSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { toast, showToast, closeToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      setLoadingMessage('Signing in...');
      
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

      setLoadingMessage('Verifying account...');
      
      // Verify student role after signin
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/auth/session', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const session = await response.json();
      
      if (session?.user?.role !== 'student') {
        const userRole = session?.user?.role || 'unknown';
        showToast(`Access denied. This account is registered as '${userRole}'. Please use the correct signin page or contact admin if this is incorrect.`, 'error');
        await signOut({ redirect: false }); // Sign out
        setIsLoading(false);
        return;
      }

      showToast('Signed in successfully!', 'success');
      router.push('/student');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        showToast('Session check timed out. Please try again.', 'error');
      } else if (error.message === 'SignIn timeout') {
        showToast('Sign in timed out. Please check your connection and try again.', 'error');
      } else {
        showToast('An error occurred during sign in', 'error');
      }
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Student Sign In</h2>
            <p className="text-gray-600 mt-2">Access your student dashboard</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Student Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B44F7] focus:border-transparent transition-all"
              placeholder="student@example.com"
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
{isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>{loadingMessage || 'Signing in...'}</span>
              </div>
            ) : (
              'Sign In as Student'
            )}
          </button>
        </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/student/signup" className="text-[#8B44F7] hover:text-[#7c3aed] font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
