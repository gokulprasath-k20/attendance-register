'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import Navbar from '@/components/navbar';
import UserInfo from '@/components/user-info';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { AttendanceTableSkeleton } from '@/components/skeleton-loader';
import { getCurrentLocation, getAccurateLocation } from '@/lib/utils/geolocation';
import { handleNetworkError, logError } from '@/lib/utils/error-handler';
import { ACADEMIC_CONFIG } from '@/config/app.config';
import { exportToExcel, exportToPDF, formatDateForExport, formatTimeForExport } from '@/lib/utils/export';
import { getSubjectsForYearAndSemester, getSemesterLabel } from '@/lib/utils/subjects';

interface AttendanceRecord {
  id: string;
  created_at: string;
  status: string;
  distance_meters: number;
  profiles?: {
    name: string;
    reg_no: string;
  };
  otp_sessions?: {
    subject: string;
    year?: number;
    semester?: number;
  };
}

export default function StaffDashboard() {
  const [formData, setFormData] = useState({
    subject: '',
    year: '',
    semester: '',
    period: '',
  });
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [staffSubjects, setStaffSubjects] = useState<string[]>([]);
  const [historyFilters, setHistoryFilters] = useState({
    subject: '',
    year: '',
    semester: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [tempFilters, setTempFilters] = useState({
    subject: '',
    year: '',
    semester: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const { toast, showToast, closeToast } = useToast();

  // Fetch staff profile to get their subjects
  const { data: profileData } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: async () => {
      const response = await fetch('/api/auth/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  // Set staff subjects from profile
  useEffect(() => {
    if (profileData?.profile?.subjects) {
      setStaffSubjects(profileData.profile.subjects);
    }
  }, [profileData]);

  const applyFilters = () => {
    setHistoryFilters(tempFilters);
  };

  const clearFilters = () => {
    setTempFilters({
      subject: '',
      year: '',
      semester: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setHistoryFilters({
      subject: '',
      year: '',
      semester: '',
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  // Update available subjects when year and semester change
  // Filter to only show subjects that the staff teaches
  useEffect(() => {
    if (formData.year && formData.semester && staffSubjects.length > 0) {
      const yearSemesterSubjects = getSubjectsForYearAndSemester(
        parseInt(formData.year),
        parseInt(formData.semester)
      );
      // Only show subjects that staff teaches AND are in the selected year/semester
      const filteredSubjects = yearSemesterSubjects.filter(subject => 
        staffSubjects.includes(subject)
      );
      setAvailableSubjects(filteredSubjects);
      // Reset subject if not available in new selection
      if (formData.subject && !filteredSubjects.includes(formData.subject)) {
        setFormData(prev => ({ ...prev, subject: '' }));
      }
    } else {
      setAvailableSubjects([]);
      setFormData(prev => ({ ...prev, subject: '' }));
    }
  }, [formData.year, formData.semester, formData.subject, staffSubjects]);

  const { data: attendanceData } = useQuery({
    queryKey: ['staff-attendance'],
    queryFn: async () => {
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
  });

  // Filter attendance records to only show the staff's subjects
  const filteredAttendanceRecords = attendanceData?.attendance?.filter(
    (record: AttendanceRecord) => {
      const recordSubject = record.otp_sessions?.subject;
      return recordSubject && staffSubjects.includes(recordSubject);
    }
  ) || [];

  const generateOTPMutation = useMutation({
    mutationFn: async (data: { latitude: number; longitude: number; subject: string; year: string; semester: string; period?: string }) => {
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedOTP(data.otpSession.otp_code);
      setOtpExpiry(data.otpSession.expires_at);
      showToast('OTP Generated Successfully!', 'success');
    },
    onError: (error: Error) => {
      setGeneratedOTP(null);
      setOtpExpiry(null);
      showToast(error.message || 'Failed to generate OTP', 'error');
    },
  });

  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      showToast('Getting your location for OTP...', 'success');
      const location = await getCurrentLocation(); // Single attempt for speed
      
      console.log('✅ Staff location for OTP:', {
        coordinates: `${location.latitude.toFixed(8)}, ${location.longitude.toFixed(8)}`,
        accuracy: `${location.accuracy.toFixed(1)}m`,
        timestamp: new Date().toISOString()
      });
      
      generateOTPMutation.mutate({
        latitude: location.latitude,
        longitude: location.longitude,
        subject: formData.subject,
        year: formData.year,
        semester: formData.semester,
        period: formData.period,
      });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'STAFF_GENERATE_OTP');
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location for OTP generation';
      showToast(errorMessage, 'error');
    }
  };

  const handleExportExcel = () => {
    if (filteredAttendanceRecords.length === 0) return;

    const records = filteredAttendanceRecords.map((record: AttendanceRecord) => ({
      studentName: record.profiles?.name || 'N/A',
      regNo: record.profiles?.reg_no || 'N/A',
      subject: record.otp_sessions?.subject || 'N/A',
      year: `${record.otp_sessions?.year || 'N/A'}/${record.otp_sessions?.semester || 'N/A'}`,
      date: formatDateForExport(record.created_at),
      time: formatTimeForExport(record.created_at),
      status: record.status === 'P' ? 'Present' : 'Absent',
      distance: record.distance_meters,
    }));

    exportToExcel(records);
  };

  const handleExportPDF = async () => {
    if (filteredAttendanceRecords.length === 0) return;

    const records = filteredAttendanceRecords.map((record: AttendanceRecord) => ({
      studentName: record.profiles?.name || 'N/A',
      regNo: record.profiles?.reg_no || 'N/A',
      subject: record.otp_sessions?.subject || 'N/A',
      year: `${record.otp_sessions?.year || 'N/A'}/${record.otp_sessions?.semester || 'N/A'}`,
      date: formatDateForExport(record.created_at),
      time: formatTimeForExport(record.created_at),
      status: record.status === 'P' ? 'Present' : 'Absent',
      distance: record.distance_meters,
    }));

    await exportToPDF(records, 'Staff Attendance Report');
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/staff/signin' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <Navbar />
      <UserInfo />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Staff Dashboard
          </h1>

          {/* Generate OTP Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generate Attendance OTP
            </h2>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>📍 10-Meter Rule:</strong> Students must be within 10 meters of your location to be marked present. Those beyond this range will be marked absent with "Too far" displayed.
              </p>
            </div>
            {staffSubjects.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your Subjects:</strong> {staffSubjects.join(', ')}
                </p>
              </div>
            )}
            {staffSubjects.length === 0 && profileData && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> No subjects assigned to your account. Please contact administrator to assign subjects.
                </p>
              </div>
            )}
            <form onSubmit={handleGenerateOTP} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value, semester: '', subject: '' })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value, subject: '' })
                    }
                    required
                    disabled={!formData.year}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Semester</option>
                    {formData.year && ACADEMIC_CONFIG.SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        {getSemesterLabel(parseInt(formData.year), sem)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    disabled={!formData.year || !formData.semester}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period (Optional)
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
                  >
                    <option value="">Select Period</option>
                    {ACADEMIC_CONFIG.PERIODS.map((period) => (
                      <option key={period} value={period}>
                        Period {period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generateOTPMutation.isPending}
                className="w-full bg-[#9B7EBD] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#8B6EAD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9B7EBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {generateOTPMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Generate OTP'
                )}
              </button>
            </form>

            {/* Display Generated OTP */}
            {generatedOTP && (
              <div className="mt-6 p-6 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ✅ OTP Generated Successfully!
                  </h3>
                  <button
                    onClick={() => {
                      setGeneratedOTP(null);
                      setOtpExpiry(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Your OTP Code:</p>
                    <p className="text-5xl font-bold text-green-600 tracking-widest mb-4">
                      {generatedOTP}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <span>⏱️</span>
                      <span>
                        Valid until: {new Date(otpExpiry!).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Share this OTP with students to mark their attendance
                </p>
              </div>
            )}
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Attendance History
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                <button
                  onClick={handleExportExcel}
                  className="bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-[#7C5C9E] hover:bg-[#6C4C8E] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* History Filters */}
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Filter Records</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-3">
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
                    {staffSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={tempFilters.year}
                    onChange={(e) => setTempFilters({ ...tempFilters, year: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
                  >
                    <option value="">All Years</option>
                    {ACADEMIC_CONFIG.YEARS.map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={tempFilters.semester}
                    onChange={(e) => setTempFilters({ ...tempFilters, semester: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
                  >
                    <option value="">All Semesters</option>
                    {ACADEMIC_CONFIG.SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
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

            {!attendanceData ? (
              <AttendanceTableSkeleton rows={8} />
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Reg No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Year/Sem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendanceRecords
                      .filter((record: AttendanceRecord) => {
                        // Apply filters
                        if (historyFilters.subject && record.otp_sessions?.subject !== historyFilters.subject) return false;
                        if (historyFilters.year && record.otp_sessions?.year?.toString() !== historyFilters.year) return false;
                        if (historyFilters.semester && record.otp_sessions?.semester?.toString() !== historyFilters.semester) return false;
                        if (historyFilters.status && record.status !== historyFilters.status) return false;
                        if (historyFilters.startDate && new Date(record.created_at) < new Date(historyFilters.startDate)) return false;
                        if (historyFilters.endDate && new Date(record.created_at) > new Date(historyFilters.endDate)) return false;
                        return true;
                      })
                      .map((record: AttendanceRecord) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.profiles?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.profiles?.reg_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.otp_sessions?.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.otp_sessions?.year}/{record.otp_sessions?.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleTimeString()}
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
