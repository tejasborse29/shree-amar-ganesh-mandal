import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const MembersPage = () => {
  const { showSuccess, showError } = useToast();
  const { hasRole } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [createModal, setCreateModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    area: 'शनिवार पेठ',
    notes: '',
    assignedCollector: ''
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/members?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      if (res.success) {
        setMembers(res.members);
        setPagination(res.pagination);
      }
    } catch (e) {
      showError('सभासद यादी लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile) {
      showError('कृपया नाव आणि मोबाईल नंबर भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/members', form);
      if (res.success) {
        showSuccess(res.message);
        setCreateModal(false);
        setForm({ name: '', mobile: '', email: '', address: '', area: 'शनिवार पेठ', notes: '', assignedCollector: '' });
        fetchMembers();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/members/${editMember.id || editMember._id}`, editMember);
      if (res.success) {
        showSuccess('सभासदाची माहिती अद्यतनित झाली.');
        setEditMember(null);
        fetchMembers();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openMemberHistory = async (member) => {
    try {
      const res = await api.get(`/members/${member.id || member._id}`);
      if (res.success) {
        setViewHistory(res.member);
      }
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            सभासद व देणगीदार (Members Directory)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण नोंदणीकृत सभासद: {pagination.total}
          </p>
        </div>

        {hasRole(['super_admin', 'treasurer', 'receipt_manager']) && (
          <button onClick={() => setCreateModal(true)} className="btn btn-primary">
            ➕ नवीन सभासद जोडा
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="amgm-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            placeholder="सभासद ID / नाव / मोबाईल / पत्ता शोधा..."
          />
          <button type="submit" className="btn btn-primary btn-sm">
            🔍 शोधा
          </button>
        </form>
      </div>

      {/* Members Table */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : members.length === 0 ? (
        <EmptyState title="कोणताही सभासद आढळला नाही" message="शोध निकष बदला किंवा नवीन सभासद नोंदवा." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>सभासद ID</th>
                <th>पूर्ण नाव</th>
                <th>मोबाईल नंबर</th>
                <th>परिसर (Area)</th>
                <th>एकूण वर्गणी (Total)</th>
                <th>कार्यकर्ता (Collector)</th>
                <th style={{ textAlign: 'right' }}>कृती (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id || m._id}>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{m.memberId}</td>
                  <td style={{ fontWeight: 700 }}>{m.name}</td>
                  <td>{m.mobile}</td>
                  <td>{m.area || '-'}</td>
                  <td style={{ fontWeight: 800, color: '#16A34A' }}>
                    ₹ {Number(m.totalContribution || 0).toLocaleString('en-IN')}
                  </td>
                  <td>{m.assignedCollector || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => openMemberHistory(m)} className="btn btn-outline-gold btn-sm" title="इतिहास पहा">
                        📜 इतिहास
                      </button>
                      {hasRole(['super_admin', 'treasurer']) && (
                        <button onClick={() => setEditMember(m)} className="btn btn-ghost btn-sm" title="माहिती संपादित करा">
                          ✏️ संपादन
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* Create Member Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="नवीन सभासद जोडा">
        <form onSubmit={handleCreateMember}>
          <div className="form-group">
            <label className="form-label">पूर्ण नाव (Full Name) *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              placeholder="उदा. श्री. विजय कुलकर्णी"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">मोबाईल नंबर (Mobile) *</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="form-input"
                placeholder="१० अंकी मोबाईल"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ईमेल (Email)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">परिसर / गल्ली (Area)</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="form-input"
                placeholder="शनिवार पेठ"
              />
            </div>
            <div className="form-group">
              <label className="form-label">नेमलेला कार्यकर्ता (Collector)</label>
              <input
                type="text"
                value={form.assignedCollector}
                onChange={(e) => setForm({ ...form, assignedCollector: e.target.value })}
                className="form-input"
                placeholder="कार्यकर्त्याचे नाव"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">पत्ता (Address)</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="form-input"
              placeholder="घर क्र., इमारत..."
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setCreateModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'जोडत आहे...' : 'सभासद जोडा'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      {editMember && (
        <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="सभासद माहिती संपादन">
          <form onSubmit={handleUpdateMember}>
            <div className="form-group">
              <label className="form-label">पूर्ण नाव *</label>
              <input
                type="text"
                value={editMember.name}
                onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">परिसर (Area)</label>
                <input
                  type="text"
                  value={editMember.area || ''}
                  onChange={(e) => setEditMember({ ...editMember, area: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">नेमलेला कार्यकर्ता</label>
                <input
                  type="text"
                  value={editMember.assignedCollector || ''}
                  onChange={(e) => setEditMember({ ...editMember, assignedCollector: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">पत्ता</label>
              <input
                type="text"
                value={editMember.address || ''}
                onChange={(e) => setEditMember({ ...editMember, address: e.target.value })}
                className="form-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setEditMember(null)} className="btn btn-ghost">रद्द करा</button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'जतन होत आहे...' : 'बदल जतन करा'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member History Modal */}
      {viewHistory && (
        <Modal isOpen={!!viewHistory} onClose={() => setViewHistory(null)} title={`${viewHistory.name} - वर्गणी इतिहास`} maxWidth="680px">
          <div style={{ marginBottom: '1.25rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
            <div><b>सभासद ID:</b> {viewHistory.memberId} | <b>मोबाईल:</b> {viewHistory.mobile}</div>
            <div><b>एकूण योगदान:</b> <span style={{ color: '#16A34A', fontWeight: 800 }}>₹ {Number(viewHistory.totalContribution || 0).toLocaleString('en-IN')}</span></div>
          </div>

          <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            पावत्यांची यादी (Receipts Issued)
          </h4>

          {viewHistory.receipts?.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>अजून कोणतीही पावती फाडलेली नाही.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {viewHistory.receipts?.map((r) => (
                <div key={r.id || r._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <span><b>{r.receiptNumber}</b> ({String(r.createdAt || '').substring(0, 10)})</span>
                  <span style={{ fontWeight: 800, color: '#16A34A' }}>₹ {Number(r.amount || 0).toLocaleString('en-IN')} ({r.paymentMode})</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

    </div>
  );
};

export default MembersPage;
