export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://shree-amar-ganesh-api.onrender.com/api' : '/api');
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

export const downloadReceiptPDF = async (receiptIdentifier, filename = null) => {
  const cleanId = String(receiptIdentifier).trim();
  const targetFilename = filename || `Receipt_${cleanId}.pdf`;
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
