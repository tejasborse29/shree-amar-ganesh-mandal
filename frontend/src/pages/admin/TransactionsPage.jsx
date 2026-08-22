import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import PrintableReceipt from '../../components/common/PrintableReceipt';
import { downloadReceiptPDF } from '../../utils/downloadHelper';

const TransactionsPage = () => {
  const { user, hasRole } = useAuth();
  const { config, activeFestival } = useConfig();
  const { showSuccess, showError } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all'); // all, income, expense, pending, inkind
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [receiptForPrint, setReceiptForPrint] = useState(null);
  const [reversing, setReversing] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const year = activeFestival?.festivalYear || 2026;
      let url = `/transactions?year=${year}&type=${typeFilter}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setTransactions(res.transactions || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      showError('नोंदी लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, activeFestival]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleOpenDetail = (txn) => {
    setSelectedTxn(txn);
    setDetailModalOpen(true);
  };

  const handleWhatsAppShare = (txn) => {
    if (!txn.mobile) {
      showError('या नोंदीत मोबाईल नंबर उपलब्ध नाही.');
      return;
    }
    const cleanMobile = txn.mobile.replace(/\D/g, '');
    const mobileWithCountry = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    
    const message = `🚩 *${config.mandalName} (${activeFestival?.name || 'गणेशोत्सव'} ${activeFestival?.financialYear || '2026-27'})*\n\n` +
      `नमस्कार *${txn.personName}* जी! 🙏\n\n` +
      `आपली वर्गणी/देणगी यशस्वीरीत्या जमा झाली आहे:\n` +
      `🧾 *पावती क्र.*: ${txn.receiptNumber || txn.txnId}\n` +
      `💰 *रक्कम*: ₹ ${txn.amount.toLocaleString('en-IN')}/-\n` +
      `📅 *दिनांक*: ${txn.dateFormatted || txn.dateDay}\n` +
      `💳 *प्रकार*: ${txn.paymentMode}\n` +
      `📍 *पडताळणी दुवा*: ${window.location.origin}/verify/${txn.receiptNumber || ''}\n\n` +
      `श्री अमर गणेश मित्र मंडळाच्या कार्यात सहकार्य केल्याबद्दल मनःपूर्वक धन्यवाद! 🌺`;

    const waUrl = `https://wa.me/${mobileWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleReverseTransaction = async (txn) => {
    if (!window.confirm(`तुम्हाला ही नोंद (₹${txn.amount}) रद्द / Reverse करायची आहे का?`)) {
      return;
    }
    setReversing(true);
    try {
      const res = await api.post(`/transactions/${txn.id}/reverse`, { type: txn.type, reason: 'समितीनुसार रद्द' });
      if (res.success) {
        showSuccess(res.message);
        setDetailModalOpen(false);
        fetchTransactions();
      }
    } catch (err) {
      showError(err.message || 'नोंद रद्द करताना त्रुटी आली');
    } finally {
      setReversing(false);
    }
  };

  const handleDeleteTransaction = async (txn) => {
    if (!window.confirm(`तुम्हाला नक्की ही नोंद कायमची हटवायची आहे का? (डेटाबेसमधून कायमची नष्ट होईल)`)) {
      return;
    }
    try {
      const res = await api.delete(`/transactions/${txn.id}?type=${txn.type}`);
      if (res.success) {
        showSuccess(res.message || 'नोंद कायमची हटवली गेली.');
        setDetailModalOpen(false);
        fetchTransactions();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  // Group transactions by date label
  const groupedTransactions = transactions.reduce((groups, txn) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    
    let dateLabel = txn.dateDay;
    if (txn.dateDay === today) dateLabel = 'आज (Today)';
    else if (txn.dateDay === yesterday) dateLabel = 'काल (Yesterday)';

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(txn);
    return groups;
  }, {});

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* 1. SEARCH BAR (Matching Screenshot 4 right) */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '0.75rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 नाव, हेड, पावती क्र., मोबाईल शोधा..."
            className="form-input"
            style={{
              paddingLeft: '1rem',
              paddingRight: '3rem',
              borderRadius: '12px',
              fontSize: '0.95rem',
              background: '#FFFFFF',
              border: '1.5px solid #E7E5E4'
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); fetchTransactions(); }}
              style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#78716C', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* 2. FILTER CHIPS BAR (Matching Screenshot 4 right) */}
      <div className="search-chip-bar">
        <button
          className={`filter-chip ${typeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          सर्व (All)
        </button>
        <button
          className={`filter-chip ${typeFilter === 'income' ? 'active' : ''}`}
          onClick={() => setTypeFilter('income')}
        >
          जमा (+₹{summary.totalIncome.toLocaleString('en-IN')})
        </button>
        <button
          className={`filter-chip ${typeFilter === 'expense' ? 'active' : ''}`}
          onClick={() => setTypeFilter('expense')}
        >
          खर्च (-₹{summary.totalExpenses.toLocaleString('en-IN')})
        </button>
        <button
          className={`filter-chip ${typeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setTypeFilter('pending')}
        >
          बाकी (Pending)
        </button>
      </div>

      {/* 3. TRANSACTIONS FEED */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <Skeleton height="65px" borderRadius="14px" />
          <Skeleton height="65px" borderRadius="14px" />
          <Skeleton height="65px" borderRadius="14px" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="amgm-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#78716C' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#292524', marginBottom: '0.4rem' }}>
            कोणतीही नोंद आढळली नाही
          </h4>
          <p style={{ fontSize: '0.85rem' }}>निवडलेल्या फिल्टरनुसार किंवा शोध परिणामात नोंदी उपलब्ध नाहीत.</p>
        </div>
      ) : (
        <div>
          {Object.entries(groupedTransactions).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <div className="date-section-header">
                <span>{dateLabel}</span>
                <span>
                  {items.length} नोंदी · निव्वळ ₹ {items.reduce((acc, cur) => acc + (cur.isIncome ? cur.amount : -cur.amount), 0).toLocaleString('en-IN')}
                </span>
              </div>

              {items.map((txn) => (
                <div
                  key={txn.id}
                  className="txn-card-item"
                  onClick={() => handleOpenDetail(txn)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div className={`txn-icon-box ${txn.type}`}>
                      {txn.type === 'income' ? '🤝' : txn.type === 'expense' ? '💸' : '⏳'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{txn.personName}</span>
                        {txn.status === 'CANCELLED' && (
                          <span style={{ fontSize: '0.65rem', background: '#FEE2E2', color: '#DC2626', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            रद्द
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#78716C', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span style={{ color: txn.isIncome ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{txn.category}</span>
                        <span>•</span>
                        <span>{txn.dateFormatted?.split(',')[1] || txn.paymentMode}</span>
                        {txn.receiptNumber && <span>• {txn.receiptNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={txn.isIncome ? 'txn-amt-positive' : 'txn-amt-negative'}>
                      {txn.isIncome ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#78716C', textAlign: 'right', textTransform: 'uppercase' }}>
                      {txn.paymentMode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 4. TRANSACTION DETAIL BOTTOM SHEET / MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="📋 नोंद सविस्तर माहिती (Transaction Detail)"
        size="md"
      >
        {selectedTxn && (
          <div>
            <div style={{ textAlign: 'center', padding: '1rem 0 1.25rem', borderBottom: '1px solid #E7E5E4' }}>
              <div style={{ fontSize: '0.85rem', color: '#78716C', marginBottom: '0.2rem' }}>
                {selectedTxn.typeLabel} नोंद ({selectedTxn.txnId})
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: selectedTxn.isIncome ? '#16A34A' : '#DC2626' }}>
                {selectedTxn.isIncome ? '+' : '-'}₹{selectedTxn.amount.toLocaleString('en-IN')}
              </div>
              <div style={{ display: 'inline-block', background: '#F5F5F4', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, color: '#44403C' }}>
                भरणा प्रकार: {selectedTxn.paymentMode}
              </div>
            </div>

            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#78716C' }}>व्यक्ती / देणगीदार / विक्रेता:</span>
                <strong>{selectedTxn.personName}</strong>
              </div>

              {selectedTxn.mobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716C' }}>मोबाईल नंबर:</span>
                  <strong>{selectedTxn.mobile}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#78716C' }}>हेड / प्रवर्ग:</span>
                <strong>{selectedTxn.category}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#78716C' }}>दिनांक व वेळ:</span>
                <span>{selectedTxn.dateFormatted}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#78716C' }}>नोंद घेणारे (Worker):</span>
                <span>{selectedTxn.collector}</span>
              </div>

              {selectedTxn.receiptNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716C' }}>पावती क्रमांक:</span>
                  <span style={{ color: '#800000', fontWeight: 800 }}>{selectedTxn.receiptNumber}</span>
                </div>
              )}

              {selectedTxn.billNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716C' }}>बिल क्रमांक:</span>
                  <span>{selectedTxn.billNumber}</span>
                </div>
              )}

              {selectedTxn.notes && (
                <div style={{ background: '#FFFDF5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #FEF3C7', color: '#78350F', fontSize: '0.85rem' }}>
                  <strong>टीप:</strong> {selectedTxn.notes}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div style={{ borderTop: '1px solid #E7E5E4', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedTxn.type === 'income' && (
                <button
                  onClick={() => handleWhatsAppShare(selectedTxn)}
                  className="btn btn-action-green"
                  style={{ width: '100%' }}
                >
                  <span>💬</span> WhatsApp वर पावती पाठवा
                </button>
              )}

              {selectedTxn.receiptNumber && (
                <button
                  onClick={() => downloadReceiptPDF(selectedTxn.receiptNumber, `Receipt_${selectedTxn.receiptNumber}.pdf`)}
                  className="btn btn-outline"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  📥 अधिकृत PDF पावती डाउनलोड करा
                </button>
              )}

              {hasRole(['super_admin', 'treasurer']) && selectedTxn.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleReverseTransaction(selectedTxn)}
                  disabled={reversing}
                  className="btn btn-ghost"
                  style={{ color: '#DC2626', width: '100%' }}
                >
                  {reversing ? 'रद्द होत आहे...' : '⚠️ ही नोंद रद्द करा (Reverse / Cancel)'}
                </button>
              )}

              {hasRole(['super_admin']) && (
                <button
                  onClick={() => handleDeleteTransaction(selectedTxn)}
                  className="btn btn-ghost"
                  style={{ color: '#991B1B', width: '100%' }}
                >
                  🗑️ ही नोंद कायमची हटवा (Delete Permanently)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default TransactionsPage;
