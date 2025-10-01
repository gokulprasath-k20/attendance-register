'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { ACADEMIC_CONFIG } from '@/config/app.config';

export default function StudentSignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    regNo: '',
    year: '',
    semester: '',
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
          role: 'student',
          regNo: formData.regNo,
          year: parseInt(formData.year),
          semester: parseInt(formData.semester),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Registration failed', 'error');
        setIsLoading(false);
        return;
      }

      showToast('Student account created successfully!', 'success');
      setTimeout(() => router.push('/auth/student/signin'), 1500);
    } catch (error) {
      showToast('An error occurred', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-blue-100 flex items-center justify-center px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-gray-900">Student Registration</h2>
          <p className="text-gray-600 mt-2">Create your student account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label htmlFor="regNo" className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number
            </label>
            <input
              id="regNo"
              type="text"
              required
              value={formData.regNo}
              onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="2024001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                id="year"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select</option>
                {ACADEMIC_CONFIG.YEARS.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                id="semester"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select</option>
                {ACADEMIC_CONFIG.SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    Sem {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white py-3 rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Create Student Account'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/student/signin" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign In
            </Link>
          </p>
          <Link href="/" className="block text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">Register as:</p>
          <div className="flex gap-2 mt-3 justify-center">
            <Link
              href="/auth/admin/signup"
              className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/auth/staff/signup"
              className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Staff
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
