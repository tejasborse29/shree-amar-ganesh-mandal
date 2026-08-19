import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminSocialPage = () => {
  const { showSuccess, showError } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    statNumber: '',
    statLabel: '',
    description: '',
    order: 0
  });

  const fetchSocial = async () => {
    setLoading(true);
    try {
      const res = await api.get('/social-activities');
      if (res.success) {
        setActivities(res.activities);
      }
    } catch (e) {
      showError('सामाजिक उपक्रम लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocial();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.statNumber) {
      showError('कृपया शीर्षक आणि आकडेवारी भरा.');
      return;
    }
    setSubmitting(true);
    try {
      if (editItem) {
        await api.put(`/social-activities/${editItem.id || editItem._id}`, form);
        showSuccess('उपक्रम अद्यतनित झाला.');
      } else {
        await api.post('/social-activities', form);
        showSuccess('नवीन उपक्रम जोडला गेला.');
      }
      setModalOpen(false);
      setEditItem(null);
      fetchSocial();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('हा उपक्रम हटवायचा आहे का?')) return;
    try {
      await api.delete(`/social-activities/${id}`);
      showSuccess('उपक्रम हटवला गेला.');
      fetchSocial();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            सामाजिक उपक्रम व्यवस्थापन (Social Impact)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            वेबसाइटवरील सामाजिक आकडेवारी व उपक्रम व्यवस्थापन
          </p>
        </div>

        <button onClick={() => { setEditItem(null); setForm({ title: '', statNumber: '', statLabel: '', description: '', order: activities.length + 1 }); setModalOpen(true); }} className="btn btn-primary">
          ➕ नवीन उपक्रम जोडा
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : activities.length === 0 ? (
        <EmptyState title="कोणताही उपक्रम आढळला नाही" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {activities.map((act) => (
            <div key={act.id || act._id} className="amgm-card amgm-card-gold" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: '0.2rem' }}>
                {act.statNumber}
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-saffron)', marginBottom: '0.4rem' }}>
                {act.title}
              </h3>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {act.statLabel}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', minHeight: '40px' }}>
                {act.description}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setEditItem(act);
                    setForm({ ...act });
                    setModalOpen(true);
                  }}
                  className="btn btn-outline-gold btn-sm"
                >
                  ✏️ संपादन
                </button>
                <button onClick={() => handleDelete(act.id || act._id)} className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'उपक्रम संपादन' : 'नवीन उपक्रम जोडा'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">उपक्रमाचे नाव (Title) *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="उदा. रक्तदान शिबिर"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">आकडेवारी (Stat Number) *</label>
              <input
                type="text"
                value={form.statNumber}
                onChange={(e) => setForm({ ...form, statNumber: e.target.value })}
                className="form-input"
                placeholder="उदा. 150+"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">आकडेवारी लेबल (Stat Label) *</label>
              <input
                type="text"
                value={form.statLabel}
                onChange={(e) => setForm({ ...form, statLabel: e.target.value })}
                className="form-input"
                placeholder="उदा. रक्तदात्यांचा सहभाग"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">तपशील (Description)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-textarea"
              placeholder="उपक्रमाची सविस्तर माहिती..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'जतन होत आहे...' : 'जतन करा'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSocialPage;
