'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { ACADEMIC_CONFIG } from '@/config/app.config';

export default function StaffSignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subjects: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const router = useRouter();

  const handleSubjectToggle = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.includes(subject)
        ? formData.subjects.filter((s) => s !== subject)
        : [...formData.subjects, subject],
    });
  };

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

    if (formData.subjects.length === 0) {
      showToast('Please select at least one subject', 'error');
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
          role: 'staff',
          subjects: formData.subjects,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Registration failed', 'error');
        setIsLoading(false);
        return;
      }

      showToast('Staff account created successfully!', 'success');
      setTimeout(() => router.push('/auth/staff/signin'), 1500);
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
            <div className="bg-gradient-to-br from-success-500 to-success-600 p-4 rounded-2xl mb-6 mx-auto w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16,4C16.88,4 17.67,4.84 17.67,5.84C17.67,6.84 16.88,7.68 16,7.68C15.12,7.68 14.33,6.84 14.33,5.84C14.33,4.84 15.12,4 16,4M16,8.86C18.03,8.86 19.67,10.5 19.67,12.53C19.67,14.56 18.03,16.2 16,16.2A3.67,3.67 0 0,1 12.33,12.53C12.33,10.5 13.97,8.86 16,8.86M16.5,21H15.5L15,19H17L16.5,21M20.5,19H22V21H20.5V19M9.5,12H11V21H9.5V12M2,11H6.5C7.06,11 7.5,11.44 7.5,12V21H6V12.5H5V21H3.5V12.5H2.5V21H1V12C1,11.44 1.44,11 2,11Z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900">Staff Registration</h2>
            <p className="text-secondary-600 mt-2">Join our teaching community</p>
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
                placeholder="staff@example.com"
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Subjects You Teach
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-secondary-200 rounded-lg bg-secondary-50">
                {ACADEMIC_CONFIG.ALL_SUBJECTS.map((subject: string) => (
                  <label
                    key={subject}
                    className="flex items-center p-2 bg-white rounded-lg hover:bg-primary-50 cursor-pointer transition-colors border border-transparent hover:border-primary-200"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="mr-2 text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <span className="text-sm text-secondary-700">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Staff Account'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-secondary-600">
              Already have an account?{' '}
              <Link href="/auth/staff/signin" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
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
                href="/auth/admin/signup"
                className="text-sm px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
              >
                Admin
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
