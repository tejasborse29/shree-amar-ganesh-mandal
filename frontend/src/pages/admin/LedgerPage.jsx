import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';

const LedgerPage = () => {
  const { config, activeFestival } = useConfig();
  const { showError } = useToast();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const year = activeFestival?.festivalYear || 2026;
      const res = await api.get(`/transactions?year=${year}&type=all&limit=100`);
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

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1917' }}>
            📜 नोंदवही व खतावणी (General Ledger)
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
            {activeFestival?.name || 'गणेशोत्सव'} · आर्थिक वर्ष {activeFestival?.financialYear || '2026-27'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => window.print()} className="btn btn-outline btn-sm">
            🖨️ नोंदवही प्रिंट करा
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <Skeleton height="250px" borderRadius="16px" />
      ) : entries.length === 0 ? (
        <div className="amgm-card" style={{ padding: '3rem', textAlign: 'center', color: '#78716C' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
          <h4>नोंदवहीत अजून कोणत्याही नोंदी नाहीत</h4>
        </div>
      ) : (
        <div className="amgm-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#FAFAF9', borderBottom: '2px solid #E7E5E4' }}>
                <th style={{ padding: '0.85rem 1rem' }}>दिनांक</th>
                <th style={{ padding: '0.85rem 1rem' }}>तपशील / खतावणी</th>
                <th style={{ padding: '0.85rem 1rem' }}>पावती / बिल क्र.</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#16A34A' }}>जमा (Credit ₹)</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#DC2626' }}>खर्च (Debit ₹)</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#2563EB' }}>शिल्लक (Balance ₹)</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F5F5F4' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#78716C' }}>
                    {item.dateDay}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <strong style={{ color: '#1C1917', fontSize: '0.9rem' }}>{item.personName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
                      {item.category} • {item.notes || item.paymentMode}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#800000' }}>
                    {item.receiptNumber || item.billNumber || '-'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: item.credit > 0 ? '#16A34A' : '#A8A29E' }}>
                    {item.credit > 0 ? `+₹${item.credit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: item.debit > 0 ? '#DC2626' : '#A8A29E' }}>
                    {item.debit > 0 ? `-₹${item.debit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#2563EB', fontSize: '0.95rem' }}>
                    ₹ {item.balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default LedgerPage;
