/**
 * Export utilities for Excel and PDF
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EXPORT_CONFIG } from '@/config/app.config';

/**
 * Convert image to base64 for embedding in exports
 */
const getLogoBase64 = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = () => {
      // Fallback if logo can't be loaded
      resolve('');
    };
    img.src = '/logo (1).png';
  });
};

export interface AttendanceRecord {
  studentName: string;
  regNo: string;
  subject: string;
  year?: string | number;
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

  // Create professional header with college branding
  worksheet.mergeCells('A1:I3');
  const headerCell = worksheet.getCell('A1');
  
  // Set row heights for better spacing
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  worksheet.getRow(3).height = 25;
  
  // Add college header with professional styling
  headerCell.value = 'AVS ENGINEERING COLLEGE';
  headerCell.font = { 
    bold: true, 
    size: 24, 
    color: { argb: 'FF0066CC' }, // Professional blue
    name: 'Arial'
  };
  headerCell.alignment = { vertical: 'middle', horizontal: 'center' };
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' }, // White background
  };

  // Add border to header with professional styling
  headerCell.border = {
    top: { style: 'thick', color: { argb: 'FF000000' } },
    left: { style: 'thick', color: { argb: 'FF000000' } },
    bottom: { style: 'thick', color: { argb: 'FF000000' } },
    right: { style: 'thick', color: { argb: 'FF000000' } }
  };

  // Add centered logo placement
  try {
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      // Single centered logo
      const logoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });
      worksheet.addImage(logoId, {
        tl: { col: 4, row: 0.2 }, // Centered position
        ext: { width: 80, height: 80 }
      });
    }
  } catch (error) {
    console.log('Could not load logo for Excel export:', error);
  }

  // Add department subtitle
  worksheet.getCell('A4').value = 'Department of Information Technology';
  worksheet.getCell('A4').font = { size: 14, bold: true, color: { argb: 'FF0066CC' } };
  worksheet.getCell('A4').alignment = { horizontal: 'center' };
  worksheet.mergeCells('A4:I4');

  // Add spacing and set column headers starting from row 6
  worksheet.getRow(5).height = 10; // Spacing row
  worksheet.getRow(6).values = [
    'Student Name', 'Reg No', 'Subject', 'Year', 'Date', 'Time', 'Status', 'Distance (m)'
  ];
  
  worksheet.columns = [
    { key: 'studentName', width: 15 },
    { key: 'regNo', width: 18 },
    { key: 'subject', width: 12 },
    { key: 'year', width: 8 },
    { key: 'date', width: 12 },
    { key: 'time', width: 10 },
    { key: 'status', width: 10 },
    { key: 'distance', width: 12 },
  ];

  // Style column header row (row 6)
  worksheet.getRow(6).font = { bold: true, size: 11 };
  worksheet.getRow(6).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }, // Light lavender like in image
  };
  worksheet.getRow(6).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(6).height = 20;
  
  // Add borders to header row
  worksheet.getRow(6).eachCell((cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add data rows starting from row 7
  let currentRow = 7;
  data.forEach((record) => {
    const row = worksheet.getRow(currentRow);
    row.values = [
      record.studentName,
      record.regNo,
      record.subject,
      record.year || 'N/A',
      record.date,
      record.time,
      record.status,
      record.distance
    ];
    currentRow++;
    
    // Add borders to all cells in the row
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    
    // Color code status like in the image
    const statusCell = row.getCell(7); // Status column
    if (record.status === 'Present') {
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
export const exportToPDF = async (
  data: AttendanceRecord[],
  title: string = 'Attendance Report',
  filename?: string
) => {
  const doc = new jsPDF();

  // Add professional college header matching Excel format
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204); // Professional blue
  doc.text('AVS ENGINEERING COLLEGE', 105, 18, { align: 'center' });
  
  // Add department name with proper spacing
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204); // Professional blue
  doc.text('Department of Information Technology', 105, 28, { align: 'center' });
  
  // Add centered logo matching Excel layout
  try {
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      // Single centered logo - AVS Engineering College logo
      doc.addImage(logoBase64, 'PNG', 92, 6, 28, 28); // Centered position
    }
  } catch (error) {
    console.log('Could not load logo for PDF export:', error);
  }

  // Add professional border around header area
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(8, 3, 194, 30);
  
  // Add subtle background for header
  doc.setFillColor(248, 249, 250); // Very light gray
  doc.rect(8, 3, 194, 30, 'F');
  doc.rect(8, 3, 194, 30); // Border on top

  // Add title below header with better spacing
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 45, { align: 'center' });

  // Add metadata with professional formatting
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Gray color
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 55);
  doc.text(`Total Records: ${data.length}`, 14, 60);

  // Prepare table data with year column
  const tableData = data.map((record) => [
    record.studentName,
    record.regNo,
    record.subject,
    record.year || 'N/A',
    record.date,
    record.time,
    record.status,
    record.distance.toFixed(2),
  ]);

  // Add table
  autoTable(doc, {
    head: [['Student Name', 'Reg No', 'Subject', 'Year/Sem', 'Date', 'Time', 'Status', 'Distance (m)']],
    body: tableData,
    startY: 70,
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
      // Color code status column (index 6 for Status)
      if (data.column.index === 6 && data.section === 'body') {
        const status = data.cell.raw as string;
        if (status === 'Present') {
          data.cell.styles.fillColor = [144, 238, 144]; // Light green
        } else if (status === 'Absent') {
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
