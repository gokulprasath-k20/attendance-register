'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { getCurrentLocation } from '@/lib/utils/geolocation';
import { formatDistance } from '@/lib/utils/geolocation';
import { getSubjectsForYearAndSemester } from '@/lib/utils/subjects';

export default function StudentDashboard() {
  const [otpCode, setOtpCode] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [studentInfo, setStudentInfo] = useState<{year?: number; semester?: number} | null>(null);
  const [historyFilters, setHistoryFilters] = useState({
    subject: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const { toast, showToast, closeToast } = useToast();

  // Fetch student profile
  const { data: profileData } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const response = await fetch('/api/auth/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  // Update available subjects based on student's year and semester
  useEffect(() => {
    if (profileData?.profile?.year && profileData?.profile?.semester) {
      setStudentInfo({
        year: profileData.profile.year,
        semester: profileData.profile.semester,
      });
      const subjects = getSubjectsForYearAndSemester(
        profileData.profile.year,
        profileData.profile.semester
      );
      setAvailableSubjects(subjects);
    }
  }, [profileData]);

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
    
    if (!selectedSubject) {
      showToast('Please select a subject before marking attendance', 'error');
      return;
    }
    
    setLoading(true);

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Submit OTP with selected subject
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpCode,
          latitude: location.latitude,
          longitude: location.longitude,
          selectedSubject,
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
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'An error occurred', 'error');
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
            {studentInfo && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your Class:</strong> Year {studentInfo.year} - Semester {studentInfo.semester}
                </p>
              </div>
            )}
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Subject *
                </label>
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                  className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="">Select the subject for this period</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select the subject that matches the current period
                </p>
              </div>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter OTP Code *
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
                disabled={loading || !selectedSubject}
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
            
            {/* History Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={historyFilters.subject}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={historyFilters.status}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="P">Present Only</option>
                  <option value="A">Absent Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={historyFilters.startDate}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={historyFilters.endDate}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {attendanceData ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Time
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
                    {attendanceData.attendance
                      .filter((record: { id: string; created_at: string; status: string; distance_meters: number; otp_sessions?: { subject: string } }) => {
                        // Apply filters
                        if (historyFilters.subject && record.otp_sessions?.subject !== historyFilters.subject) return false;
                        if (historyFilters.status && record.status !== historyFilters.status) return false;
                        if (historyFilters.startDate && new Date(record.created_at) < new Date(historyFilters.startDate)) return false;
                        if (historyFilters.endDate && new Date(record.created_at) > new Date(historyFilters.endDate)) return false;
                        return true;
                      })
                      .map((record: { id: string; created_at: string; status: string; distance_meters: number; otp_sessions?: { subject: string } }) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleTimeString()}
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
