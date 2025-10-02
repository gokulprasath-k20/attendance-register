'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';

export default function AdminSignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Registration failed', 'error');
        setIsLoading(false);
        return;
      }

      showToast('Admin account created successfully!', 'success');
      setTimeout(() => router.push('/auth/admin/signin'), 1500);
    } catch {
      showToast('An error occurred', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-md w-full card animate-scale-in">
        <div className="card-body">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-warning-500 to-warning-600 p-4 rounded-2xl mb-6 mx-auto w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M21,16V14.5C21,13.96 20.75,13.5 20.35,13.24L19,12.5V11.5L20.35,10.76C20.75,10.5 21,10.04 21,9.5V8C21,7.45 20.55,7 20,7H4C3.45,7 3,7.45 3,8V9.5C3,10.04 3.25,10.5 3.65,10.76L5,11.5V12.5L3.65,13.24C3.25,13.5 3,13.96 3,14.5V16C3,16.55 3.45,17 4,17H20C20.55,17 21,16.55 21,16Z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900">Admin Registration</h2>
            <p className="text-secondary-600 mt-2">Create your administrator account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="admin@example.com"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                placeholder="Create a secure password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="form-input"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-secondary-600">
              Already have an account?{' '}
              <Link href="/auth/admin/signin" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Sign In
              </Link>
            </p>
            <Link href="/" className="block text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              ← Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-secondary-200">
            <p className="text-center text-sm text-secondary-500 mb-4">Register as:</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/auth/staff/signup"
                className="text-sm px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
              >
                Staff
              </Link>
              <Link
                href="/auth/student/signup"
                className="text-sm px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
              >
                Student
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
