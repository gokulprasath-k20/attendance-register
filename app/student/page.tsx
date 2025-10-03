'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import Navbar from '@/components/navbar';
import UserInfo from '@/components/user-info';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { AttendanceTableSkeleton } from '@/components/skeleton-loader';
import { getCurrentLocation, getAccurateLocation, isDistanceReasonable } from '@/lib/utils/geolocation';
import { formatDistance } from '@/lib/utils/geolocation';
import { getSubjectsForYearAndSemester, getActualSemesterNumber } from '@/lib/utils/subjects';

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
  const [tempFilters, setTempFilters] = useState({
    subject: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const { toast, showToast, closeToast } = useToast();

  const applyFilters = () => {
    setHistoryFilters(tempFilters);
  };

  const clearFilters = () => {
    setTempFilters({
      subject: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setHistoryFilters({
      subject: '',
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  // Fetch student profile
  const { data: profileData, error: profileError, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      console.log('Fetching student profile...');
      const response = await fetch('/api/auth/profile');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile fetch failed:', errorData);
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      console.log('Profile data received:', data);
      return data;
    },
    retry: 1,
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

  const { data: attendanceData, error: attendanceError, refetch } = useQuery({
    queryKey: ['student-attendance'],
    queryFn: async () => {
      console.log('Fetching attendance data...');
      const response = await fetch('/api/attendance');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Attendance fetch failed:', errorData);
        throw new Error(errorData.error || 'Failed to fetch attendance');
      }
      const data = await response.json();
      console.log('Attendance data received:', data);
      return data;
    },
    retry: 1,
  });

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject) {
      showToast('Please select a subject before marking attendance', 'error');
      return;
    }
    
    setLoading(true);

    try {
      // Get accurate location with multiple attempts for maximum precision
      showToast('Getting your precise location for 10-meter rule...', 'success');
      const location = await getAccurateLocation(5);
      
      // Validate location accuracy - stricter for 10m rule
      if (!isDistanceReasonable(0, location.accuracy)) {
        showToast(`GPS accuracy insufficient (${location.accuracy.toFixed(1)}m). For the 10-meter rule, we need ≤20m accuracy. Please move outside or near a window and try again.`, 'error');
        return;
      }
      
      console.log('✅ Using high-precision location:', {
        coordinates: `${location.latitude.toFixed(8)}, ${location.longitude.toFixed(8)}`,
        accuracy: `${location.accuracy.toFixed(1)}m`
      });

      console.log('Using location:', location);

      // Submit OTP with selected subject
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpCode,
          latitude: location.latitude,
          longitude: location.longitude,
          selectedSubject,
          accuracy: location.accuracy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to mark attendance', 'error');
      } else {
        const distanceText = formatDistance(data.attendance.distance);
        const statusText = data.attendance.status === 'P' ? 'Present' : 'Absent';
        
        if (data.attendance.status === 'P') {
          showToast(
            `✅ Attendance marked: ${statusText} (Distance: ${distanceText})`,
            'success'
          );
        } else {
          showToast(
            `❌ Attendance marked: ${statusText} - You are too far from the staff location`,
            'error'
          );
        }
        
        setOtpCode('');
        refetch();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/student/signin' });
  };

  // Show loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-lg text-gray-600">Loading student dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Unable to Load Student Dashboard
              </h2>
              <p className="text-red-700 mb-4">
                {profileError.message || 'Failed to load student profile'}
              </p>
              <div className="space-y-2 text-sm text-red-600">
                <p><strong>Possible causes:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>You are not logged in as a student</li>
                  <li>Your student profile is not set up properly</li>
                  <li>Database connection issues</li>
                  <li>Missing environment variables</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.href = '/auth/student/signin'}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Go to Student Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <Navbar />
      <UserInfo />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Student Dashboard
          </h1>

          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Debug Information</h3>
              <div className="text-sm text-blue-700">
                <p><strong>Profile Data:</strong> {JSON.stringify(profileData, null, 2)}</p>
                <p><strong>Available Subjects:</strong> {availableSubjects.join(', ')}</p>
                <p><strong>Student Info:</strong> {JSON.stringify(studentInfo, null, 2)}</p>
                {studentInfo && (
                  <p><strong>Actual Semester:</strong> {getActualSemesterNumber(studentInfo.year!, studentInfo.semester!)}</p>
                )}
              </div>
            </div>
          )}

          {/* Mark Attendance Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Mark Attendance
            </h2>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>📍 10-Meter Rule:</strong> You must be within 10 meters of your staff's location to be marked present. Make sure you're close to your teacher before submitting the OTP.
              </p>
            </div>
            {studentInfo && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your Class:</strong> Year {studentInfo.year} - Semester {getActualSemesterNumber(studentInfo.year!, studentInfo.semester!)}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!availableSubjects.length}
                >
                  <option value="">Select the subject for this period</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter 6-digit OTP"
                  disabled={!selectedSubject}
                />
              </div>
              <button
                type="submit"
                disabled={!selectedSubject || !otpCode || loading}
                className="w-full bg-[#9B7EBD] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#8B6EAD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9B7EBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={tempFilters.subject}
                    onChange={(e) => setTempFilters({ ...tempFilters, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
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
                    value={tempFilters.status}
                    onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
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
                    value={tempFilters.startDate}
                    onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempFilters.endDate}
                    onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {attendanceError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">
                  <strong>Error loading attendance history:</strong> {attendanceError.message}
                </p>
              </div>
            ) : !attendanceData ? (
              <AttendanceTableSkeleton rows={8} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50/50">
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
            )}
          </div>
          
          {/* Sign Out Button at Bottom Right */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-md hover:shadow-lg text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
