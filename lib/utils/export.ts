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

  // Create header with college branding like the image
  worksheet.mergeCells('A1:I3');
  const headerCell = worksheet.getCell('A1');
  
  // Add college header with logos and text
  headerCell.value = 'AVS ENGINEERING COLLEGE\nDepartment of Information Technology';
  headerCell.font = { 
    bold: true, 
    size: 20, 
    color: { argb: 'FF0066CC' }, // Blue color like in image
    name: 'Arial'
  };
  headerCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' }, // White background
  };

  // Add border to header
  headerCell.border = {
    top: { style: 'thick', color: { argb: 'FF000000' } },
    left: { style: 'thick', color: { argb: 'FF000000' } },
    bottom: { style: 'thick', color: { argb: 'FF000000' } },
    right: { style: 'thick', color: { argb: 'FF000000' } }
  };

  // Add logo images
  try {
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      // Left logo
      const leftLogoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });
      worksheet.addImage(leftLogoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 60, height: 60 }
      });

      // Right logo (same logo for now, you can change this)
      const rightLogoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });
      worksheet.addImage(rightLogoId, {
        tl: { col: 7.5, row: 0 },
        ext: { width: 60, height: 60 }
      });
    }
  } catch (error) {
    console.log('Could not load logo for Excel export:', error);
  }

  // Add college logo note
  worksheet.getCell('A4').value = 'College Logo: logo (1).png';
  worksheet.getCell('A4').font = { size: 10, italic: true, color: { argb: 'FF666666' } };
  worksheet.getCell('A4').alignment = { horizontal: 'left' };

  // Set column headers starting from row 5 (like in the image)
  worksheet.getRow(5).values = [
    'Student Name', 'Reg No', 'Subject', 'Year/Sem', 'Date', 'Time', 'Status', 'Distance (m)'
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

  // Style column header row (row 5)
  worksheet.getRow(5).font = { bold: true, size: 11 };
  worksheet.getRow(5).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }, // Light gray like in image
  };
  worksheet.getRow(5).alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add borders to header row
  worksheet.getRow(5).eachCell((cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add data rows starting from row 6
  let currentRow = 6;
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

  // Add college header matching Excel format
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204); // Blue color
  doc.text('AVS ENGINEERING COLLEGE', 105, 15, { align: 'center' });
  
  // Add department name
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204); // Blue color
  doc.text('Department of Information Technology', 105, 25, { align: 'center' });
  
  // Add logos matching Excel layout
  try {
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      // Left logo
      doc.addImage(logoBase64, 'PNG', 15, 8, 20, 20);
      // Right logo  
      doc.addImage(logoBase64, 'PNG', 175, 8, 20, 20);
    }
  } catch (error) {
    console.log('Could not load logo for PDF export:', error);
  }

  // Add border around header area
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(10, 5, 190, 25);

  // Add title below header
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 40, { align: 'center' });

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 50);
  doc.text(`Total Records: ${data.length}`, 14, 55);

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
    startY: 65,
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
