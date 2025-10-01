/**
 * Export utilities for Excel and PDF
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EXPORT_CONFIG } from '@/config/app.config';

export interface AttendanceRecord {
  studentName: string;
  regNo: string;
  subject: string;
  date: string;
  time: string;
  status: string;
  distance: number;
}

/**
 * Export attendance data to Excel
 */
export const exportToExcel = async (
  data: AttendanceRecord[],
  filename?: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  // Set column widths
  worksheet.columns = [
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Reg No', key: 'regNo', width: 15 },
    { header: 'Subject', key: 'subject', width: 20 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Time', key: 'time', width: 10 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Distance (m)', key: 'distance', width: 12 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }, // Lavender
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data rows
  data.forEach((record) => {
    const row = worksheet.addRow(record);
    
    // Color code status
    const statusCell = row.getCell('status');
    if (record.status === 'P') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' }, // Light green
      };
    } else {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCCCB' }, // Light red
      };
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${EXPORT_CONFIG.EXCEL_FILENAME_PREFIX}${Date.now()}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Export attendance data to PDF
 */
export const exportToPDF = (
  data: AttendanceRecord[],
  title: string = 'Attendance Report',
  filename?: string
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(123, 104, 238); // Lavender
  doc.text(title, 14, 20);

  // Add metadata
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total Records: ${data.length}`, 14, 36);

  // Prepare table data
  const tableData = data.map((record) => [
    record.studentName,
    record.regNo,
    record.subject,
    record.date,
    record.time,
    record.status,
    record.distance.toFixed(2),
  ]);

  // Add table
  autoTable(doc, {
    head: [['Student Name', 'Reg No', 'Subject', 'Date', 'Time', 'Status', 'Distance (m)']],
    body: tableData,
    startY: 45,
    theme: 'striped',
    headStyles: {
      fillColor: [230, 230, 250], // Lavender
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      5: {
        cellWidth: 15,
        halign: 'center',
      },
    },
    didParseCell: (data) => {
      // Color code status column
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.raw as string;
        if (status === 'P') {
          data.cell.styles.fillColor = [144, 238, 144]; // Light green
        } else if (status === 'A') {
          data.cell.styles.fillColor = [255, 204, 203]; // Light red
        }
      }
    },
  });

  // Save PDF
  doc.save(filename || `${EXPORT_CONFIG.PDF_FILENAME_PREFIX}${Date.now()}.pdf`);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Format time for export
 */
export const formatTimeForExport = (date: Date | string): string => {
  const d = new Date(date);
  return d.toTimeString().split(' ')[0];
};
