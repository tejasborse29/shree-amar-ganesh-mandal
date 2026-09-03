import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import { downloadLedgerPDF } from '../../utils/downloadHelper';

const LedgerPage = () => {
  const { config, activeFestival } = useConfig();
  const { showError, showSuccess } = useToast();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [modeFilter, setModeFilter] = useState('ALL'); // ALL, CASH, ONLINE

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const year = activeFestival?.festivalYear || 2026;
      const res = await api.get(`/transactions?year=${year}&type=all&limit=300`);
      if (res.success) {
        // Reverse array to calculate running balance chronologically (oldest to newest)
        const sortedOldest = [...(res.transactions || [])].reverse();
        let runningBal = 0;
        const ledgerWithBalance = sortedOldest.map((t) => {
          const credit = t.isIncome ? t.amount : 0;
          const debit = !t.isIncome && t.type === 'expense' ? t.amount : 0;
          runningBal += (credit - debit);
          return {
            ...t,
            credit,
            debit,
            balance: runningBal
          };
        });
        // Display newest first in ledger table
        setEntries(ledgerWithBalance.reverse());
      }
    } catch (err) {
      showError('नोंदवही लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [activeFestival]);

  const filteredEntries = entries.filter((item) => {
    if (modeFilter === 'ALL') return true;
    const mode = (item.paymentMode || '').toLowerCase();
    if (modeFilter === 'CASH') {
      return mode === 'cash' || mode === 'रोख';
    }
    if (modeFilter === 'ONLINE') {
      return mode !== 'cash' && mode !== 'रोख';
    }
    return true;
  });

  const totalCredit = filteredEntries.reduce((sum, item) => sum + (item.credit || 0), 0);
  const totalDebit = filteredEntries.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalNetBalance = totalCredit - totalDebit;

  const handleDownloadLedgerPDF = async (filterMode = modeFilter) => {
    setDownloading(true);
    try {
      const year = activeFestival?.festivalYear || 2026;
      const suffix = filterMode === 'CASH' ? '_Cash' : filterMode === 'ONLINE' ? '_Online' : '_All';
      const filename = `AMGM_General_Ledger_${year}${suffix}.pdf`;
      const elem = document.getElementById('ledger-printable-area');
      await downloadLedgerPDF(year, filename, elem);
      showSuccess('नोंदवही PDF यशस्वीरीत्या डाउनलोड झाली!');
    } catch (err) {
      showError(err.message || 'PDF डाउनलोड करताना त्रुटी आली');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Header & Actions */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1917' }}>
            📜 नोंदवही व खतावणी (General Ledger)
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
            {activeFestival?.name || 'गणेशोत्सव'} · आर्थिक वर्ष {activeFestival?.financialYear || '2026-27'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleDownloadLedgerPDF('ALL')}
            disabled={downloading}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700 }}
          >
            <span>📥</span> सर्व PDF
          </button>
          <button
            onClick={() => { setModeFilter('CASH'); handleDownloadLedgerPDF('CASH'); }}
            disabled={downloading}
            className="btn btn-saffron btn-sm"
            style={{ fontWeight: 700 }}
          >
            <span>💵</span> रोख (Cash) PDF
          </button>
          <button
            onClick={() => { setModeFilter('ONLINE'); handleDownloadLedgerPDF('ONLINE'); }}
            disabled={downloading}
            className="btn btn-gold btn-sm"
            style={{ fontWeight: 700 }}
          >
            <span>📱</span> ऑनलाइन PDF
          </button>
          <button onClick={handlePrint} className="btn btn-outline btn-sm">
            <span>🖨️</span> प्रिंट
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="search-chip-bar no-print" style={{ marginBottom: '1rem' }}>
        <button
          className={`filter-chip ${modeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setModeFilter('ALL')}
        >
          सर्व नोंदी ({entries.length})
        </button>
        <button
          className={`filter-chip ${modeFilter === 'CASH' ? 'active' : ''}`}
          onClick={() => setModeFilter('CASH')}
        >
          💵 रोख व्यवहार (Cash Only)
        </button>
        <button
          className={`filter-chip ${modeFilter === 'ONLINE' ? 'active' : ''}`}
          onClick={() => setModeFilter('ONLINE')}
        >
          📱 ऑनलाइन / UPI (Online Only)
        </button>
      </div>

      {/* Ledger Table Container */}
      <div id="ledger-printable-area" style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E7E5E4' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #D4AF37' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#800000', margin: '0 0 0.25rem' }}>
            {config.mandalName}
          </h2>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D97706' }}>
            अधिकृत नोंदवही व खतावणी (General Ledger) · {activeFestival?.name || 'गणेशोत्सव'} {activeFestival?.festivalYear || config.festivalYear}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#78716C', marginTop: '0.2rem' }}>
            प्रवर्ग: {modeFilter === 'ALL' ? 'सर्व नोंदी (Cash + Online)' : modeFilter === 'CASH' ? 'फक्त रोख व्यवहार (Cash Only)' : 'फक्त ऑनलाइन व्यवहार (Online Only)'}
          </div>
        </div>

        {loading ? (
          <Skeleton height="250px" borderRadius="16px" />
        ) : filteredEntries.length === 0 ? (
          <div className="amgm-card" style={{ padding: '3rem', textAlign: 'center', color: '#78716C' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
            <h4>या फिल्टरमध्ये कोणत्याही नोंदी नाहीत</h4>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#800000', color: '#FFFFFF' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#FFFFFF', fontWeight: 700 }}>दिनांक</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#FFFFFF', fontWeight: 700 }}>तपशील / खतावणी</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#FFFFFF', fontWeight: 700 }}>पावती / बिल क्र.</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#86EFAC', fontWeight: 700 }}>जमा (Credit ₹)</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#FCA5A5', fontWeight: 700 }}>खर्च (Debit ₹)</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#93C5FD', fontWeight: 700 }}>शिल्लक (Balance ₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F5F5F4', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#78716C', whiteSpace: 'nowrap' }}>
                      {item.dateDay || String(item.date || item.createdAt || '').substring(0, 10)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: '#1C1917', fontSize: '0.9rem' }}>{item.personName || item.donorName || item.vendor || 'नोंद'}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
                        {item.category} • <span style={{ textTransform: 'uppercase' }}>{item.paymentMode || 'Cash'}</span> {item.notes ? `• ${item.notes}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#800000', whiteSpace: 'nowrap' }}>
                      {item.receiptNumber || item.billNumber || '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: item.credit > 0 ? '#16A34A' : '#A8A29E' }}>
                      {item.credit > 0 ? `+${item.credit.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: item.debit > 0 ? '#DC2626' : '#A8A29E' }}>
                      {item.debit > 0 ? `-${item.debit.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#2563EB', fontSize: '0.95rem' }}>
                      {item.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#FEF3C7', borderTop: '2px solid #D4AF37', fontWeight: 800 }}>
                  <td style={{ padding: '0.9rem 1rem', color: '#800000', fontSize: '0.95rem' }}>
                    एकूण (TOTAL)
                  </td>
                  <td colSpan={2} style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#78716C' }}>
                    एकूण {filteredEntries.length} नोंदी
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: '#16A34A', fontSize: '1rem' }}>
                    ₹ {totalCredit.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: '#DC2626', fontSize: '1rem' }}>
                    ₹ {totalDebit.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: '#2563EB', fontSize: '1.05rem' }}>
                    ₹ {totalNetBalance.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Official Signature Lines (Matching Reference Image) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', padding: '0 2rem 1.5rem', textAlign: 'center' }}>
              <div style={{ minWidth: '180px' }}>
                <div style={{ borderBottom: '1.5px solid #1C1917', marginBottom: '0.5rem', width: '180px', margin: '0 auto 0.5rem' }}></div>
                <strong style={{ fontSize: '0.95rem', color: '#1C1917' }}>अध्यक्ष / President</strong>
              </div>
              <div style={{ minWidth: '180px' }}>
                <div style={{ borderBottom: '1.5px solid #1C1917', marginBottom: '0.5rem', width: '180px', margin: '0 auto 0.5rem' }}></div>
                <strong style={{ fontSize: '0.95rem', color: '#1C1917' }}>खजिनदार / Treasurer</strong>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

export default LedgerPage;
