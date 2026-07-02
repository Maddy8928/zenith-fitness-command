import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type ExportData = any[];

export interface ExportOptions {
    filename: string;
    title: string;
    headers: string[];
    data: (string | number)[][];
    category?: string;
    dateRange?: string;
}

export const exportToPDF = (options: ExportOptions) => {
    const { filename, title, headers, data, category, dateRange } = options;
    const doc = new jsPDF();

    // Set high-end styling
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ZENITH FITNESS', 15, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('COMMAND HUB | STORE MANAGEMENT', 15, 30);

    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(new Date().toLocaleDateString(), 180, 30);

    // Report Header
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, 55);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    if (category) doc.text(`Category: ${category}`, 15, 63);
    if (dateRange) doc.text(`Date Range: ${dateRange}`, 15, 68);

    autoTable(doc, {
        startY: 75,
        head: [headers],
        body: data,
        theme: 'striped',
        headStyles: {
            fillColor: [79, 70, 229], // indigo-600
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // slate-50
        }
    });

    doc.save(`${filename}.pdf`);
};

export const exportToExcel = (options: ExportOptions) => {
    const { filename, headers, data } = options;
    
    // Combine headers and data
    const wsData = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToCSV = (options: ExportOptions) => {
    const { filename, headers, data } = options;
    
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const handleExport = async (format: 'PDF' | 'EXCEL' | 'CSV', options: ExportOptions) => {
    switch (format) {
        case 'PDF':
            exportToPDF(options);
            break;
        case 'EXCEL':
            exportToExcel(options);
            break;
        case 'CSV':
            exportToCSV(options);
            break;
    }
};
