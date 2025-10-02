'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import LoadingSpinner from '@/components/loading-spinner';
import Toast, { useToast } from '@/components/toast';
import { AttendanceTableSkeleton } from '@/components/skeleton-loader';
import { exportToExcel, exportToPDF, formatDateForExport, formatTimeForExport } from '@/lib/utils/export';

export default function AdminDashboard() {
  const { toast, showToast, closeToast } = useToast();
  const [filters, setFilters] = useState({
    subject: '',
    status: '',
    year: '',
    semester: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  const { data: attendanceData, refetch } = useQuery({
    queryKey: ['admin-attendance'],
    queryFn: async () => {
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
  });

  // Filter function
  const filteredAttendance = attendanceData?.attendance?.filter((record: any) => {
    const matchesSubject = !filters.subject || record.otp_sessions?.subject?.toLowerCase().includes(filters.subject.toLowerCase());
    const matchesStatus = !filters.status || record.status === filters.status;
    const matchesYear = !filters.year || record.profiles?.year?.toString() === filters.year;
    const matchesSemester = !filters.semester || record.profiles?.semester?.toString() === filters.semester;
    const matchesSearch = !filters.searchTerm || 
      record.profiles?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      record.profiles?.reg_no?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const recordDate = new Date(record.created_at).toISOString().split('T')[0];
    const matchesDateFrom = !filters.dateFrom || recordDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || recordDate <= filters.dateTo;

    return matchesSubject && matchesStatus && matchesYear && matchesSemester && matchesSearch && matchesDateFrom && matchesDateTo;
  }) || [];

  const clearFilters = () => {
    setFilters({
      subject: '',
      status: '',
      year: '',
      semester: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  const handleExportExcel = () => {
    if (!filteredAttendance.length) return;

    const records = filteredAttendance.map((record: any) => ({
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
    if (!filteredAttendance.length) return;

    const records = filteredAttendance.map((record: any) => ({
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
    <div className="min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-3">
            Admin Dashboard
          </h1>
          <p className="text-xl text-secondary-600">
            Comprehensive attendance management and analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14Z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Total Records</p>
                  <p className="text-2xl font-bold text-secondary-900">{attendanceData?.attendance?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-success-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Present</p>
                  <p className="text-2xl font-bold text-success-600">
                    {attendanceData?.attendance?.filter((r: any) => r.status === 'P').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-error-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-error-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Absent</p>
                  <p className="text-2xl font-bold text-error-600">
                    {attendanceData?.attendance?.filter((r: any) => r.status === 'A').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-warning-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C10.9,10.5 10,9.6 10,8.5C10,7.4 10.9,6.5 12,6.5C13.1,6.5 14,7.4 14,8.5C14,9.6 13.1,10.5 12,10.5Z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Filtered</p>
                  <p className="text-2xl font-bold text-warning-600">{filteredAttendance.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-secondary-900">Filters & Search</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name or Reg No..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Subject name..."
                  value={filters.subject}
                  onChange={(e) => setFilters({...filters, subject: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="form-input"
                >
                  <option value="">All Status</option>
                  <option value="P">Present</option>
                  <option value="A">Absent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="form-input"
                >
                  <option value="">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Semester</label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({...filters, semester: e.target.value})}
                  className="form-input"
                >
                  <option value="">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">
                  Attendance Records
                </h2>
                <p className="text-sm text-secondary-600 mt-1">
                  Showing {filteredAttendance.length} of {attendanceData?.attendance?.length || 0} records
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExportExcel}
                  disabled={!filteredAttendance.length}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={!filteredAttendance.length}
                  className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">

            {!attendanceData ? (
              <div className="p-6">
                <AttendanceTableSkeleton rows={10} />
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C10.9,10.5 10,9.6 10,8.5C10,7.4 10.9,6.5 12,6.5C13.1,6.5 14,7.4 14,8.5C14,9.6 13.1,10.5 12,10.5Z"/>
                </svg>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No records found</h3>
                <p className="text-secondary-600">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Reg No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Year/Sem
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Distance (m)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {filteredAttendance.map((record: any, index: number) => (
                      <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50/30'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-primary-700">
                                {record.profiles?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-secondary-900">
                              {record.profiles?.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 font-mono">
                          {record.profiles?.reg_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                          <span className="badge badge-primary">
                            Y{record.profiles?.year} S{record.profiles?.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {record.otp_sessions?.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                          <div>
                            <div className="font-medium">
                              {new Date(record.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-secondary-500">
                              {new Date(record.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            record.status === 'P' ? 'badge-success' : 'badge-error'
                          }`}>
                            {record.status === 'P' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 font-mono">
                          {record.distance_meters.toFixed(2)}m
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
