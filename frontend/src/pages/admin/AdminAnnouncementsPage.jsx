import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminAnnouncementsPage = () => {
  const { showSuccess, showError } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    priority: 'medium',
    active: true
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      if (res.success) {
        setAnnouncements(res.announcements);
      }
    } catch (e) {
      showError('सूचना लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      showError('कृपया शीर्षक आणि संदेश भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/announcements', form);
      if (res.success) {
        showSuccess(res.message);
        setAddModal(false);
        setForm({ title: '', message: '', priority: 'medium', active: true });
        fetchAnnouncements();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      const res = await api.patch(`/announcements/${item.id || item._id}/toggle`);
      if (res.success) {
        showSuccess('स्थिती अद्यतनित झाली.');
        fetchAnnouncements();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ही सूचना हटवायची आहे का?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      showSuccess('सूचना हटवली गेली.');
      fetchAnnouncements();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            सूचना व फलक व्यवस्थापन (Announcements)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            वेबसाइटवरील टॉप टिकर व सूचना फलक
          </p>
        </div>

        <button onClick={() => setAddModal(true)} className="btn btn-primary">
          ➕ नवीन सूचना प्रसिद्ध करा
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : announcements.length === 0 ? (
        <EmptyState title="कोणतीही सूचना आढळली नाही" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map((a) => (
            <div
              key={a.id || a._id}
              className="amgm-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: a.priority === 'urgent' ? '5px solid #DC2626' : a.priority === 'high' ? '5px solid #EA580C' : '5px solid var(--color-gold)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    {a.title}
                  </h3>
                  <span className={`badge ${a.priority === 'urgent' ? 'badge-error' : a.priority === 'high' ? 'badge-warning' : 'badge-primary'}`}>
                    {a.priority}
                  </span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  {a.message}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                  प्रसिद्ध: {String(a.publishDate || a.createdAt || '').substring(0, 10)} • द्वारे: {a.createdBy}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  onClick={() => toggleStatus(a)}
                  className={`badge ${a.active ? 'badge-success' : 'badge-warning'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {a.active ? 'सक्रिय (Active)' : 'बंद (Inactive)'}
                </button>
                <button onClick={() => handleDelete(a.id || a._id)} className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="नवीन सूचना प्रसिद्ध करा">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">सूचनेचे शीर्षक (Title) *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="उदा. 🔔 सर्व कार्यकर्त्यांची महत्त्वाची बैठक"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">सविस्तर संदेश (Message) *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="form-textarea"
              placeholder="सूचनेचा मजकूर येथे लिहा..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">प्राधान्य (Priority)</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="form-select"
            >
              <option value="medium">मध्यम (Medium)</option>
              <option value="high">महत्त्वाचे (High)</option>
              <option value="urgent">अत्यंत महत्त्वाचे / तात्काळ (Urgent)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setAddModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'प्रसिद्ध होत आहे...' : '📢 प्रसिद्ध करा'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncementsPage;
