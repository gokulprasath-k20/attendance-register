'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { getCurrentLocation } from '@/lib/utils/geolocation';
import { getRemainingTime, formatRemainingTime } from '@/lib/utils/otp';
import { ACADEMIC_CONFIG } from '@/config/app.config';
import { exportToExcel, exportToPDF, formatDateForExport, formatTimeForExport } from '@/lib/utils/export';

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
  };
}

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    subject: '',
    year: '',
    semester: '',
  });
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const { toast, showToast, closeToast } = useToast();

  const { data: attendanceData, refetch: refetchAttendance } = useQuery({
    queryKey: ['staff-attendance'],
    queryFn: async () => {
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
  });

  const generateOTPMutation = useMutation({
    mutationFn: async (data: { latitude: number; longitude: number; subject: string; year: string; semester: string }) => {
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
      const location = await getCurrentLocation();
      
      generateOTPMutation.mutate({
        latitude: location.latitude,
        longitude: location.longitude,
        subject: formData.subject,
        year: formData.year,
        semester: formData.semester,
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to get location', 'error');
    }
  };

  const handleExportExcel = () => {
    if (!attendanceData?.attendance) return;

    const records = attendanceData.attendance.map((record: any) => ({
      studentName: record.profiles?.name || 'N/A',
      regNo: record.profiles?.reg_no || 'N/A',
      subject: record.otp_sessions?.subject || 'N/A',
      date: formatDateForExport(record.created_at),
      time: formatTimeForExport(record.created_at),
      status: record.status === 'P' ? 'Present' : 'Absent',
      distance: record.distance_meters,
    }));

    exportToExcel(records);
  };

  const handleExportPDF = () => {
    if (!attendanceData?.attendance) return;

    const records = attendanceData.attendance.map((record: AttendanceRecord) => ({
      studentName: record.profiles?.name || 'N/A',
      regNo: record.profiles?.reg_no || 'N/A',
      subject: record.otp_sessions?.subject || 'N/A',
      date: formatDateForExport(record.created_at),
      time: formatTimeForExport(record.created_at),
      status: record.status === 'P' ? 'Present' : 'Absent',
      distance: record.distance_meters,
    }));

    exportToPDF(records, 'Staff Attendance Report');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Staff Dashboard
          </h1>

          {/* Generate OTP Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generate Attendance OTP
            </h2>
            <form onSubmit={handleGenerateOTP} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Subject</option>
                    {ACADEMIC_CONFIG.SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Year</option>
                    {[2, 3, 4].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Semester</option>
                    {ACADEMIC_CONFIG.SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generateOTPMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
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
                Attendance Records
              </h2>
              <div className="space-x-2">
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {attendanceData ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.attendance.map((record: any) => (
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
                          {new Date(record.created_at).toLocaleDateString()}
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
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
