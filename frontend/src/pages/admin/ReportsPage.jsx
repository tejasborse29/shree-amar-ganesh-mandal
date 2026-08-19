import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';

const ReportsPage = () => {
  const { showError } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = '/reports/financial';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setReport(res);
      }
    } catch (e) {
      showError('अहवाल लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportPDF = () => {
    window.open('/api/reports/export-pdf', '_blank');
  };

  const handleExportCSV = () => {
    window.open('/api/reports/export-csv', '_blank');
  };

  const summary = report?.summary || {};

  return (
    <div>
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            आर्थिक अहवाल व ऑडिट (Financial Reports)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            मंडळाचा अधिकृत आर्थिक ताळेबंद व अहवाल
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={handleExportPDF} className="btn btn-gold btn-sm">
            📥 PDF अहवाल डाउनलोड करा
          </button>
          <button onClick={handleExportCSV} className="btn btn-outline btn-sm">
            📊 Excel / CSV डाउनलोड
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="amgm-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>प्रारंभ दिनांक (Start Date)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>अंतिम दिनांक (End Date)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            🔍 अहवाल तयार करा
          </button>
        </form>
      </div>

      {/* Report Body */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* 3 Main KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="amgm-card amgm-card-gold" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                एकूण जमा (Total Income)
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16A34A' }}>
                ₹ {summary.totalIncome?.toLocaleString('en-IN') || 0}
              </div>
            </div>

            <div className="amgm-card amgm-card-gold" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                एकूण खर्च (Total Expenses)
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#DC2626' }}>
                ₹ {summary.totalExpenses?.toLocaleString('en-IN') || 0}
              </div>
            </div>

            <div className="amgm-card amgm-card-gold" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                शिल्लक रक्कम (Net Balance)
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563EB' }}>
                ₹ {summary.currentBalance?.toLocaleString('en-IN') || 0}
              </div>
            </div>
          </div>

          {/* Expense Categories Table */}
          <div className="amgm-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              खर्च प्रवर्ग विश्लेषण (Expense Categories Breakdown)
            </h3>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>खर्च प्रवर्ग (Category)</th>
                    <th>नोंदी संख्या (Count)</th>
                    <th style={{ textAlign: 'right' }}>एकूण रक्कम (Amount)</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.expenseByCategory?.map((item) => (
                    <tr key={item.category}>
                      <td style={{ fontWeight: 700 }}>{item.category}</td>
                      <td>{item.count} नोंदी</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#DC2626' }}>
                        ₹ {item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Income Categories Table */}
          <div className="amgm-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              जमा प्रवर्ग विश्लेषण (Income Categories Breakdown)
            </h3>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>जमा प्रवर्ग (Category)</th>
                    <th>पावत्या संख्या (Count)</th>
                    <th style={{ textAlign: 'right' }}>एकूण रक्कम (Amount)</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.incomeByCategory?.map((item) => (
                    <tr key={item.category}>
                      <td style={{ fontWeight: 700 }}>{item.category}</td>
                      <td>{item.count} नोंदी</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#16A34A' }}>
                        ₹ {item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReportsPage;
