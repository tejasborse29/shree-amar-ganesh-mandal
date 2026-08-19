import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const EXPENSE_CATEGORIES = [
  'Decoration', 'Sound', 'Lighting', 'Puja material', 'Prasad',
  'Stage', 'Electrical', 'Advertisement', 'Transportation',
  'Cultural program', 'Visarjan', 'Social activity', 'Miscellaneous'
];

const ExpensesPage = () => {
  const { showSuccess, showError } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [addModal, setAddModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    category: 'Decoration',
    amount: '',
    description: '',
    vendor: '',
    billNumber: '',
    paymentMode: 'cash',
    billAttachmentUrl: ''
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let url = `/expenses?page=${page}&limit=15`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const res = await api.get(url);
      if (res.success) {
        setExpenses(res.expenses);
        setPagination(res.pagination);
      }
    } catch (e) {
      showError('खर्च यादी लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, categoryFilter]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      showError('कृपया आवश्यक माहिती भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/expenses', form);
      if (res.success) {
        showSuccess(res.message);
        setAddModal(false);
        setForm({ category: 'Decoration', amount: '', description: '', vendor: '', billNumber: '', paymentMode: 'cash', billAttachmentUrl: '' });
        fetchExpenses();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelExpense = async (e) => {
    e.preventDefault();
    if (!cancelReason) {
      showError('कृपया कारण लिहा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/expenses/${cancelModal.id || cancelModal._id}/cancel`, { reason: cancelReason });
      if (res.success) {
        showSuccess(res.message);
        setCancelModal(null);
        setCancelReason('');
        fetchExpenses();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            खर्च व्यवस्थापन (Expense Management)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण नोंदी: {pagination.total}
          </p>
        </div>

        <button onClick={() => setAddModal(true)} className="btn btn-danger">
          💸 नवीन खर्च नोंदवा
        </button>
      </div>

      {/* Filter */}
      <div className="amgm-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="form-select"
          style={{ width: '220px' }}
        >
          <option value="">सर्व खर्च प्रवर्ग (All Categories)</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : expenses.length === 0 ? (
        <EmptyState title="कोणताही खर्च आढळला नाही" message="नवीन खर्च नोंद करा." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>दिनांक</th>
                <th>प्रवर्ग (Category)</th>
                <th>तपशील (Description)</th>
                <th>दुकानदार / विक्रेता</th>
                <th>बिल क्र.</th>
                <th>रक्कम (Amount)</th>
                <th>नोंदणीकर्ता</th>
                <th>स्थिती</th>
                <th style={{ textAlign: 'right' }}>कृती</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => {
                const isCancelled = exp.status === 'CANCELLED';
                return (
                  <tr key={exp.id || exp._id} style={{ opacity: isCancelled ? 0.6 : 1 }}>
                    <td>{String(exp.date || '').substring(0, 10)}</td>
                    <td><span className="badge badge-warning">{exp.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{exp.description}</td>
                    <td>{exp.vendor || '-'}</td>
                    <td>{exp.billNumber || '-'}</td>
                    <td style={{ fontWeight: 800, color: '#DC2626' }}>
                      ₹ {Number(exp.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td>{exp.addedByName || 'समिती'}</td>
                    <td>
                      <span className={`badge ${!isCancelled ? 'badge-success' : 'badge-error'}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!isCancelled && (
                        <button
                          onClick={() => { setCancelModal(exp); setCancelReason(''); }}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#DC2626' }}
                        >
                          ❌ रद्द
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar">
            <span>पृष्ठ {pagination.page} / {pagination.pages}</span>
            <div className="pagination-controls">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="pagination-btn">
                ← मागील
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="pagination-btn">
                पुढील →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="नवीन खर्च नोंदवा">
        <form onSubmit={handleAddExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">प्रवर्ग (Category) *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="form-select"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">रक्कम (Amount ₹) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="form-input"
                placeholder="उदा. 4500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">खर्चाचा तपशील (Description) *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input"
              placeholder="उदा. मंडप अंतर्गत सजावट"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">दुकानदार / विक्रेता (Vendor)</label>
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="form-input"
                placeholder="उदा. रंगोली डेकोरेटर्स"
              />
            </div>
            <div className="form-group">
              <label className="form-label">बिल क्र. (Bill No.)</label>
              <input
                type="text"
                value={form.billNumber}
                onChange={(e) => setForm({ ...form, billNumber: e.target.value })}
                className="form-input"
                placeholder="BILL-101"
              />
            </div>
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
                <option value="online">UPI / Online</option>
                <option value="cheque">धनादेश (Cheque)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">बिल फोटो / पावती URL</label>
              <input
                type="text"
                value={form.billAttachmentUrl}
                onChange={(e) => setForm({ ...form, billAttachmentUrl: e.target.value })}
                className="form-input"
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setAddModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'नोंद होत आहे...' : '💸 खर्च नोंदवा'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="खर्च नोंद रद्द करा">
        <form onSubmit={handleCancelExpense}>
          <p style={{ fontSize: '0.85rem', color: '#991B1B', marginBottom: '1rem' }}>
            खर्च ₹{cancelModal?.amount} ची नोंद रद्द केल्यास ती मंडळाच्या हिशोबातून हटवली जाईल.
          </p>
          <div className="form-group">
            <label className="form-label">रद्द करण्याचे कारण *</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-textarea"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setCancelModal(null)} className="btn btn-ghost">मागे जा</button>
            <button type="submit" disabled={submitting} className="btn btn-danger">रद्द करा</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
