'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { AttendanceTableSkeleton } from '@/components/skeleton-loader';
import { exportToExcel, exportToPDF, formatDateForExport, formatTimeForExport } from '@/lib/utils/export';
import { getAllSubjects, getActualSemesterNumber } from '@/lib/utils/subjects';

export default function AdminDashboard() {
  const { toast, showToast, closeToast } = useToast();
  
  // Filter state management
  const [historyFilters, setHistoryFilters] = useState({
    subject: '',
    status: '',
    studentName: '',
    regNo: '',
    year: '',
    semester: '',
    startDate: '',
    endDate: '',
  });
  
  const [tempFilters, setTempFilters] = useState({
    subject: '',
    status: '',
    studentName: '',
    regNo: '',
    year: '',
    semester: '',
    startDate: '',
    endDate: '',
  });

  const applyFilters = () => {
    setHistoryFilters(tempFilters);
  };

  const clearFilters = () => {
    setTempFilters({
      subject: '',
      status: '',
      studentName: '',
      regNo: '',
      year: '',
      semester: '',
      startDate: '',
      endDate: '',
    });
    setHistoryFilters({
      subject: '',
      status: '',
      studentName: '',
      regNo: '',
      year: '',
      semester: '',
      startDate: '',
      endDate: '',
    });
  };

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
    <div className="min-h-screen bg-gray-50">
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
                  className="bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-[#7C5C9E] hover:bg-[#6C4C8E] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Filter Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
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
                    {getAllSubjects().map((subject) => (
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
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={tempFilters.studentName}
                    onChange={(e) => setTempFilters({ ...tempFilters, studentName: e.target.value })}
                    placeholder="Search by name..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reg No
                  </label>
                  <input
                    type="text"
                    value={tempFilters.regNo}
                    onChange={(e) => setTempFilters({ ...tempFilters, regNo: e.target.value })}
                    placeholder="Search by reg no..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EBD]"
                  />
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
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
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
                    <option value="1">Semester 1 (Internal)</option>
                    <option value="2">Semester 2 (Internal)</option>
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
              <AttendanceTableSkeleton rows={10} />
            ) : (
              <div className="overflow-x-auto">
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
                    {attendanceData.attendance
                      .filter((record: any) => {
                        // Apply filters
                        if (historyFilters.subject && record.otp_sessions?.subject !== historyFilters.subject) return false;
                        if (historyFilters.status && record.status !== historyFilters.status) return false;
                        if (historyFilters.studentName && !record.profiles?.name?.toLowerCase().includes(historyFilters.studentName.toLowerCase())) return false;
                        if (historyFilters.regNo && !record.profiles?.reg_no?.toLowerCase().includes(historyFilters.regNo.toLowerCase())) return false;
                        if (historyFilters.year && record.profiles?.year?.toString() !== historyFilters.year) return false;
                        if (historyFilters.semester && record.profiles?.semester?.toString() !== historyFilters.semester) return false;
                        if (historyFilters.startDate && new Date(record.created_at) < new Date(historyFilters.startDate)) return false;
                        if (historyFilters.endDate && new Date(record.created_at) > new Date(historyFilters.endDate)) return false;
                        return true;
                      })
                      .map((record: any) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.profiles?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.profiles?.reg_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.profiles?.year && record.profiles?.semester 
                            ? `Year ${record.profiles.year} / Sem ${getActualSemesterNumber(record.profiles.year, record.profiles.semester)}`
                            : 'N/A'
                          }
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
