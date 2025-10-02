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
    } catch {
      showToast('An error occurred', 'error');
      setIsLoading(false);
    }
  };

  // Get available semesters based on selected year
  const getAvailableSemesters = () => {
    if (!formData.year) return [];
    const year = parseInt(formData.year);
    const yearConfig = ACADEMIC_CONFIG.SUBJECTS_BY_YEAR_SEMESTER[year as keyof typeof ACADEMIC_CONFIG.SUBJECTS_BY_YEAR_SEMESTER];
    return yearConfig ? Object.keys(yearConfig).map(Number) : [];
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="max-w-md w-full card animate-scale-in">
        <div className="card-body">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl mb-6 mx-auto w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900">Student Registration</h2>
            <p className="text-secondary-600 mt-2">Create your student account to get started</p>
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
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label htmlFor="regNo" className="block text-sm font-medium text-secondary-700 mb-2">
                Registration Number
              </label>
              <input
                id="regNo"
                type="text"
                required
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                className="form-input"
                placeholder="Enter your registration number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-secondary-700 mb-2">
                  Academic Year
                </label>
                <select
                  id="year"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value, semester: '' })}
                  className="form-input"
                >
                  <option value="">Select Year</option>
                  {ACADEMIC_CONFIG.YEARS.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-secondary-700 mb-2">
                  Semester
                </label>
                <select
                  id="semester"
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  disabled={!formData.year}
                  className="form-input disabled:bg-secondary-100 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.year ? 'Select Semester' : 'Select year first'}</option>
                  {getAvailableSemesters().map((sem) => {
                    const actualSemester = (parseInt(formData.year) - 1) * 2 + sem;
                    return (
                      <option key={sem} value={sem}>
                        Semester {actualSemester}
                      </option>
                    );
                  })}
                </select>
              </div>
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
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Student Account'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-secondary-600">
              Already have an account?{' '}
              <Link href="/auth/student/signin" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
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
                href="/auth/staff/signup"
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
