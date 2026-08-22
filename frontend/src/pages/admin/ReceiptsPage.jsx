import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import PrintableReceipt from '../../components/common/PrintableReceipt';
import { downloadReceiptPDF } from '../../utils/downloadHelper';

const ReceiptsPage = () => {
  const { showSuccess, showError } = useToast();
  const { hasRole } = useAuth();

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    donorName: '',
    donorMobile: '',
    donorAddress: '',
    donorEmail: '',
    amount: '',
    paymentMode: 'cash',
    transactionRef: '',
    notes: ''
  });

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      let url = `/receipts?page=${page}&limit=15&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.success) {
        setReceipts(res.receipts);
        setPagination(res.pagination);
      }
    } catch (e) {
      showError('पावत्या लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReceipts();
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    if (!form.donorName || !form.donorMobile || !form.amount) {
      showError('कृपया आवश्यक माहिती भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/receipts', form);
      if (res.success && res.receipt) {
        showSuccess(res.message);
        setCreateModal(false);
        setViewReceipt(res.receipt);
        setForm({ donorName: '', donorMobile: '', donorAddress: '', donorEmail: '', amount: '', paymentMode: 'cash', transactionRef: '', notes: '' });
        fetchReceipts();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReceipt = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      showError('कृपया पावती रद्द करण्याचे कारण लिहा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/receipts/${cancelModal.id || cancelModal._id}/cancel`, { reason: cancelReason });
      if (res.success) {
        showSuccess(res.message);
        setCancelModal(null);
        setCancelReason('');
        fetchReceipts();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReceipt = async (r) => {
    if (!window.confirm(`तुम्हाला नक्की पावती क्र. "${r.receiptNumber}" कायमची हटवायची आहे का? (ही क्रिया पूर्ववत करता येणार नाही)`)) {
      return;
    }
    try {
      const res = await api.delete(`/receipts/${r.id || r._id}`);
      if (res.success) {
        showSuccess(res.message || 'पावती कायमची हटवली गेली.');
        fetchReceipts();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            डिजिटल पावत्या व्यवस्थापन (Receipts)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण नोंदणीकृत पावत्या: {pagination.total}
          </p>
        </div>

        {hasRole(['super_admin', 'treasurer', 'receipt_manager']) && (
          <button onClick={() => setCreateModal(true)} className="btn btn-primary">
            ➕ नवीन पावती तयार करा
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="amgm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            placeholder="पावती क्र. / नाव / मोबाईल / व्यवहार ID शोधा..."
          />
          <button type="submit" className="btn btn-primary btn-sm">
            🔍 शोधा
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: '150px' }}
          >
            <option value="">सर्व स्थिती (All)</option>
            <option value="ACTIVE">सक्रिय (Active)</option>
            <option value="CANCELLED">रद्द (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : receipts.length === 0 ? (
        <EmptyState title="कोणतीही पावती आढळली नाही" message="शोध निकष बदला किंवा नवीन पावती तयार करा." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>पावती क्र.</th>
                <th>दिनांक</th>
                <th>देणगीदाराचे नाव</th>
                <th>मोबाईल</th>
                <th>रक्कम</th>
                <th>पद्धत</th>
                <th>स्वीकारकर्ता</th>
                <th>स्थिती</th>
                <th style={{ textAlign: 'right' }}>कृती (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => {
                const isCancelled = r.status === 'CANCELLED';
                return (
                  <tr key={r.id || r._id} style={{ opacity: isCancelled ? 0.65 : 1 }}>
                    <td style={{ fontWeight: 800, color: isCancelled ? 'var(--color-error)' : 'var(--color-primary)' }}>
                      {r.receiptNumber}
                    </td>
                    <td>{String(r.createdAt || '').substring(0, 10)}</td>
                    <td style={{ fontWeight: 700 }}>{r.donorName}</td>
                    <td>{r.donorMobile || '-'}</td>
                    <td style={{ fontWeight: 800, color: '#16A34A' }}>
                      ₹ {Number(r.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{r.paymentMode || 'CASH'}</td>
                    <td>{r.collectedByName || 'समिती'}</td>
                    <td>
                      <span className={`badge ${!isCancelled ? 'badge-success' : 'badge-error'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setViewReceipt(r)}
                          className="btn btn-outline-gold btn-sm"
                          title="पावती पहा / प्रिंट"
                        >
                          👁️ पहा
                        </button>
                        <button
                          onClick={() => downloadReceiptPDF(r.receiptNumber || r.id || r._id, `Receipt_${r.receiptNumber}.pdf`)}
                          className="btn btn-ghost btn-sm"
                          title="PDF डाउनलोड"
                        >
                          📥 PDF
                        </button>
                        {!isCancelled && hasRole(['super_admin', 'treasurer']) && (
                          <button
                            onClick={() => { setCancelModal(r); setCancelReason(''); }}
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#DC2626' }}
                            title="पावती रद्द करा"
                          >
                            ❌ रद्द
                          </button>
                        )}
                        {hasRole(['super_admin']) && (
                          <button
                            onClick={() => handleDeleteReceipt(r)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#991B1B' }}
                            title="पावती कायमची हटवा (Delete)"
                          >
                            🗑️ हटवा
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar">
            <span>पृष्ठ {pagination.page} / {pagination.pages} (एकूण {pagination.total} नोंदी)</span>
            <div className="pagination-controls">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="pagination-btn"
              >
                ← मागील
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="pagination-btn"
              >
                पुढील →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View / Print Receipt Modal */}
      <Modal isOpen={!!viewReceipt} onClose={() => setViewReceipt(null)} title="अधिकृत डिजिटल पावती" maxWidth="680px">
        <PrintableReceipt receipt={viewReceipt} />
      </Modal>

      {/* Create Receipt Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="नवीन पावती फाडा">
        <form onSubmit={handleCreateReceipt} autoComplete="off">
          <div className="form-group">
            <label className="form-label">देणगीदाराचे नाव (Donor Name) *</label>
            <input
              type="text"
              autoComplete="off"
              value={form.donorName}
              onChange={(e) => setForm({ ...form, donorName: e.target.value })}
              className="form-input"
              placeholder="उदा. श्री. सचिन रमेश जोशी"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">देणगीदाराचा मोबाईल नंबर (Donor Mobile) *</label>
              <input
                type="tel"
                autoComplete="off"
                value={form.donorMobile}
                onChange={(e) => setForm({ ...form, donorMobile: e.target.value })}
                className="form-input"
                placeholder="देणगीदाराचा १० अंकी नंबर"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">वर्गणी रक्कम (Amount ₹) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="form-input"
                placeholder="उदा. 1001"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">पत्ता (Address)</label>
            <input
              type="text"
              value={form.donorAddress}
              onChange={(e) => setForm({ ...form, donorAddress: e.target.value })}
              className="form-input"
              placeholder="उदा. शनिवार पेठ, पुणे"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">भरणा प्रकार (Payment Mode)</label>
              <select
                value={form.paymentMode}
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                className="form-select"
              >
                <option value="cash">रोख (Cash)</option>
                <option value="online">UPI / QR कोड (Online)</option>
                <option value="netbanking">Net Banking / NEFT</option>
                <option value="cheque">धनादेश (Cheque)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">व्यवहार संदर्भ (Transaction Ref)</label>
              <input
                type="text"
                value={form.transactionRef}
                onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
                className="form-input"
                placeholder="UPI ID / Ref No."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">नोंद (Notes)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="form-input"
              placeholder="उदा. वार्षिक गणेशोत्सव वर्गणी २०२६"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setCreateModal(false)} className="btn btn-ghost">
              रद्द करा
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'तयार होत आहे...' : '🧾 पावती तयार करा'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Receipt Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="पावती रद्द करा (Cancel Receipt)">
        <form onSubmit={handleCancelReceipt}>
          <div style={{ background: '#FEE2E2', borderLeft: '4px solid #DC2626', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#991B1B' }}>
            ⚠️ सावधान: पावती क्र. <b>{cancelModal?.receiptNumber}</b> (रक्कम ₹{cancelModal?.amount}) रद्द केल्याने मंडळाच्या शिल्लक रकमेतून सदर रक्कम वजा होईल आणि ऑडिट लॉगमधे नोंद होईल.
          </div>

          <div className="form-group">
            <label className="form-label">पावती रद्द करण्याचे कारण (Reason for Cancellation) *</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-textarea"
              placeholder="उदा. चुकीची रक्कम नोंदवली / दुबार पावती / धनादेश बाउन्स..."
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setCancelModal(null)} className="btn btn-ghost">
              मागे जा
            </button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'रद्द होत आहे...' : '❌ पावती कायमस्वरूपी रद्द करा'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ReceiptsPage;
