import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const IncomePage = () => {
  const { showSuccess, showError } = useToast();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [addModal, setAddModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    category: 'Vargani',
    amount: '',
    description: '',
    donorName: '',
    paymentMode: 'cash',
    referenceNumber: ''
  });

  const fetchIncome = async () => {
    setLoading(true);
    try {
      let url = `/income?page=${page}&limit=15`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const res = await api.get(url);
      if (res.success) {
        setIncomes(res.income);
        setPagination(res.pagination);
      }
    } catch (e) {
      showError('जमा नोंदी लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [page, categoryFilter]);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      showError('कृपया रक्कम आणि तपशील प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/income', form);
      if (res.success) {
        showSuccess(res.message);
        setAddModal(false);
        setForm({ category: 'Vargani', amount: '', description: '', donorName: '', paymentMode: 'cash', referenceNumber: '' });
        fetchIncome();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelIncome = async (e) => {
    e.preventDefault();
    if (!cancelReason) {
      showError('कृपया कारण लिहा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/income/${cancelModal.id || cancelModal._id}/cancel`, { reason: cancelReason });
      if (res.success) {
        showSuccess(res.message);
        setCancelModal(null);
        setCancelReason('');
        fetchIncome();
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
            जमा निधी व्यवस्थापन (Income Management)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण नोंदी: {pagination.total}
          </p>
        </div>

        <button onClick={() => setAddModal(true)} className="btn btn-primary">
          ➕ नवीन जमा नोंदवा
        </button>
      </div>

      {/* Filter */}
      <div className="amgm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="form-select"
          style={{ width: '220px' }}
        >
          <option value="">सर्व प्रवर्ग (All Categories)</option>
          <option value="Vargani">वर्गणी (Vargani)</option>
          <option value="Donation">देणगी (Donation)</option>
          <option value="Sponsorship">प्रायोजकत्व (Sponsorship)</option>
          <option value="Event income">कार्यक्रम जमा (Event Income)</option>
          <option value="Other">इतर (Other)</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : incomes.length === 0 ? (
        <EmptyState title="कोणतीही जमा नोंद आढळली नाही" message="नवीन जमा नोंद करा." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>दिनांक</th>
                <th>प्रवर्ग (Category)</th>
                <th>तपशील (Description)</th>
                <th>देणगीदार / स्रोत</th>
                <th>रक्कम (Amount)</th>
                <th>पद्धत</th>
                <th>नोंदणीकर्ता</th>
                <th>स्थिती</th>
                <th style={{ textAlign: 'right' }}>कृती</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((inc) => {
                const isCancelled = inc.status === 'CANCELLED';
                return (
                  <tr key={inc.id || inc._id} style={{ opacity: isCancelled ? 0.6 : 1 }}>
                    <td>{String(inc.date || '').substring(0, 10)}</td>
                    <td><span className="badge badge-primary">{inc.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{inc.description}</td>
                    <td>{inc.donorName || '-'}</td>
                    <td style={{ fontWeight: 800, color: '#16A34A' }}>
                      ₹ {Number(inc.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{inc.paymentMode}</td>
                    <td>{inc.addedByName || 'समिती'}</td>
                    <td>
                      <span className={`badge ${!isCancelled ? 'badge-success' : 'badge-error'}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!isCancelled && (
                        <button
                          onClick={() => { setCancelModal(inc); setCancelReason(''); }}
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

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="नवीन जमा नोंदवा">
        <form onSubmit={handleAddIncome}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">प्रवर्ग (Category) *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="form-select"
              >
                <option value="Vargani">वर्गणी (Vargani)</option>
                <option value="Donation">देणगी (Donation)</option>
                <option value="Sponsorship">प्रायोजकत्व (Sponsorship)</option>
                <option value="Event income">कार्यक्रम जमा (Event Income)</option>
                <option value="Other">इतर (Other)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">रक्कम (Amount ₹) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="form-input"
                placeholder="उदा. 5000"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">तपशील (Description) *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input"
              placeholder="उदा. मुख्य प्रायोजक देणगी"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">देणगीदार / कंपनी (Donor / Source)</label>
              <input
                type="text"
                value={form.donorName}
                onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                className="form-input"
                placeholder="उदा. समर्थ ऑटोमोबाईल्स"
              />
            </div>
            <div className="form-group">
              <label className="form-label">भरणा पद्धत (Payment Mode)</label>
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
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setAddModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'नोंद होत आहे...' : 'जमा नोंदवा'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="जमा नोंद रद्द करा">
        <form onSubmit={handleCancelIncome}>
          <p style={{ fontSize: '0.85rem', color: '#991B1B', marginBottom: '1rem' }}>
            रक्कम ₹{cancelModal?.amount} ची नोंद रद्द केल्यास एकूण शिल्लकेतून ही रक्कम वजा होईल.
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

export default IncomePage;
