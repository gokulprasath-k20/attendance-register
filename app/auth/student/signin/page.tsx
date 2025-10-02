'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';

export default function StudentSignIn() {
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

      // Verify student role after signin
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      if (session?.user?.role !== 'student') {
        showToast('Access denied. Student credentials required.', 'error');
        setIsLoading(false);
        return;
      }

      showToast('Signed in successfully!', 'success');
      router.push('/student');
    } catch {
      showToast('An error occurred', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-md w-full card animate-scale-in">
        <div className="card-body">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl mb-6 mx-auto w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900">Student Sign In</h2>
            <p className="text-secondary-600 mt-2">Welcome back! Access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Student Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In as Student'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-secondary-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/student/signup" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Register
              </Link>
            </p>
            <Link href="/" className="block text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              ← Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-secondary-200">
            <p className="text-center text-sm text-secondary-500 mb-4">Sign in as:</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/auth/admin/signin"
                className="text-sm px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
              >
                Admin
              </Link>
              <Link
                href="/auth/staff/signin"
                className="text-sm px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
              >
                Staff
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
