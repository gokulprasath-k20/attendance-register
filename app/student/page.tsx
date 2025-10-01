'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { getCurrentLocation } from '@/lib/utils/geolocation';
import { formatDistance } from '@/lib/utils/geolocation';

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  const { data: attendanceData, refetch } = useQuery({
    queryKey: ['student-attendance'],
    queryFn: async () => {
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
  });

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Submit OTP
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpCode,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to mark attendance', 'error');
      } else {
        showToast(
          `Attendance marked: ${data.attendance.status} (Distance: ${formatDistance(data.attendance.distance)})`,
          data.attendance.status === 'P' ? 'success' : 'error'
        );
        setOtpCode('');
        refetch();
      }
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Student Dashboard
          </h1>

          {/* Mark Attendance Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Mark Attendance
            </h2>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  maxLength={6}
                  className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Mark Attendance'}
              </button>
            </form>
          </div>

          {/* Attendance History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Attendance History
            </h2>
            {attendanceData ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Distance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.attendance.map((record: any) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.otp_sessions?.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'P'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {record.status === 'P' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDistance(record.distance_meters)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
