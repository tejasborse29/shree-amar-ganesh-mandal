import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://shree-amar-ganesh-api.onrender.com/api' : '/api');
};

/**
 * Generates a high-definition PDF directly from a DOM element.
 * Retains 100% native Devanagari text shaping, fonts, colors, and styling without glitches.
 */
export const exportElementToPDF = async (element, defaultFilename = 'download.pdf') => {
  if (!element) return false;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 3, // High-res 300 DPI equivalent
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 800
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const margin = 10;
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pageHeight - (margin * 2)));
    pdf.save(defaultFilename);
    return true;
  } catch (err) {
    console.error('Client-side PDF generation error:', err);
    return false;
  }
};

export const downloadBlobFile = async (endpoint, defaultFilename = 'download.pdf') => {
  const apiBase = getApiBaseUrl();
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const token = localStorage.getItem('amgm_auth_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(fullUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    console.warn('Direct blob fetch failed, falling back to direct URL open:', err);
    window.open(fullUrl, '_blank');
    return true;
  }
};

export const downloadReceiptPDF = async (receiptIdentifier, filename = null, domElement = null) => {
  const cleanId = String(receiptIdentifier).trim();
  const targetFilename = filename || `Receipt_${cleanId}.pdf`;

  // 1. Try crisp client-side rendering first if element provided or present in DOM
  const targetElem = domElement || document.getElementById('official-printable-receipt') || document.querySelector('.receipt-wrapper');
  if (targetElem) {
    const success = await exportElementToPDF(targetElem, targetFilename);
    if (success) return true;
  }

  // 2. Fallback to backend PDF endpoint
  return downloadBlobFile(`/receipts/${cleanId}/pdf`, targetFilename);
};

export const downloadReportPDF = async (year, filename = null) => {
  const targetFilename = filename || `AMGM_Financial_Report_${year}.pdf`;
  return downloadBlobFile(`/reports/download-pdf?year=${year}`, targetFilename);
};

export const downloadReportCSV = async (year, filename = null) => {
  const targetFilename = filename || `AMGM_Transactions_${year}.csv`;
  return downloadBlobFile(`/reports/export-csv?year=${year}`, targetFilename);
};

export const downloadLedgerPDF = async (year, filename = null) => {
  const targetFilename = filename || `AMGM_General_Ledger_${year}.pdf`;
  return downloadBlobFile(`/reports/ledger-pdf?year=${year}`, targetFilename);
};
