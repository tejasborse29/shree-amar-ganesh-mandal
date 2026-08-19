import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const DEPARTMENTS = [
  'मंडप व स्टेज व्यवस्था (Mandap & Stage)',
  'ध्वनिक्षेपक व रोषणाई (Sound & Lighting)',
  'पूजा व धार्मिक विधी (Puja & Rituals)',
  'प्रसाद व अन्नदान (Prasad & Food)',
  'सुरक्षा व शिस्त (Security & Discipline)',
  'सांस्कृतिक व कार्यक्रम (Cultural)',
  'प्रचार व संपर्क (PR & Media)',
  'पावती व देणगी संकलन (Collection)',
  'सामाजिक उपक्रम (Social Activities)',
  'तांत्रिक व डिजिटल (Tech & Media)'
];

const VolunteersPage = () => {
  const { showSuccess, showError } = useToast();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    username: '',
    password: 'Volunteer@AMGM2026',
    department: 'मंडप व स्टेज व्यवस्था (Mandap & Stage)',
    role: 'volunteer'
  });

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/volunteers?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setVolunteers(res.volunteers);
      }
    } catch (e) {
      showError('कार्यकर्ते यादी लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile) {
      showError('कृपया नाव आणि मोबाईल नंबर भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/volunteers', form);
      if (res.success) {
        showSuccess(res.message);
        setAddModal(false);
        setForm({ name: '', mobile: '', username: '', password: 'Volunteer@AMGM2026', department: 'मंडप व स्टेज व्यवस्था (Mandap & Stage)', role: 'volunteer' });
        fetchVolunteers();
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
            मंडळ कार्यकर्ते (Volunteers & Karyakarta)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण सक्रिय कार्यकर्ते: {volunteers.length}
          </p>
        </div>

        <button onClick={() => setAddModal(true)} className="btn btn-primary">
          ➕ नवीन कार्यकर्ता जोडा
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : volunteers.length === 0 ? (
        <EmptyState title="कोणताही कार्यकर्ता आढळला नाही" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {volunteers.map((v) => (
            <div key={v.id || v._id} className="amgm-card amgm-card-gold" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #800000, #E65100)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  {v.name ? v.name.charAt(0) : 'क'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 800 }}>{v.name}</h3>
                  <span className="badge badge-primary">{v.role}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                <div>🏢 विभाग: <b>{v.department}</b></div>
                <div>📞 फोन: <b>{v.mobile}</b></div>
                <div>📋 प्रलंबित कामे: <b style={{ color: 'var(--color-saffron)' }}>{v.pendingTasksCount || 0}</b></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="नवीन कार्यकर्ता जोडा">
        <form onSubmit={handleAddVolunteer}>
          <div className="form-group">
            <label className="form-label">पूर्ण नाव (Full Name) *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              placeholder="उदा. श्री. ओंकार गायकवाड"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">मोबाईल नंबर *</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value, username: e.target.value })}
                className="form-input"
                placeholder="१० अंकी मोबाईल"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">भूमिका (Role)</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="form-select"
              >
                <option value="volunteer">कार्यकर्ता (Volunteer)</option>
                <option value="receipt_manager">पावती प्रमुख (Receipt Manager)</option>
                <option value="event_manager">कार्यक्रम प्रमुख (Event Manager)</option>
                <option value="treasurer">खजिनदार (Treasurer)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">विभाग / जबाबदारी (Department)</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="form-select"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">लॉगिन पासवर्ड</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setAddModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'जोडत आहे...' : 'कार्यकर्ता जोडा'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VolunteersPage;
