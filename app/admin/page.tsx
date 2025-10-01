'use client';

import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { exportToExcel, exportToPDF, formatDateForExport, formatTimeForExport } from '@/lib/utils/export';

export default function AdminDashboard() {
  const { toast, showToast, closeToast } = useToast();

  const { data: attendanceData, refetch } = useQuery({
    queryKey: ['admin-attendance'],
    queryFn: async () => {
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
  });

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

    const records = attendanceData.attendance.map((record: any) => ({
      studentName: record.profiles?.name || 'N/A',
      regNo: record.profiles?.reg_no || 'N/A',
      subject: record.otp_sessions?.subject || 'N/A',
      date: formatDateForExport(record.created_at),
      time: formatTimeForExport(record.created_at),
      status: record.status === 'P' ? 'Present' : 'Absent',
      distance: record.distance_meters,
    }));

    exportToPDF(records, 'Admin Attendance Report');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              View and manage attendance records. Staff and students register independently.
            </p>
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                All Attendance Records
              </h2>
              <div className="space-x-2">
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
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
                        Year/Sem
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Distance (m)
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
                          {record.profiles?.year}/{record.profiles?.semester}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.distance_meters.toFixed(2)}
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
