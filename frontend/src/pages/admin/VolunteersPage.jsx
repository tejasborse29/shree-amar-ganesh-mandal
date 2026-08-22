import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const DEPARTMENTS = [
  'सर्वसाधारण प्रशासन (Super Admin)',
  'हिशोब व वित्त विभाग (Finance)',
  'पावती व देणगी विभाग (Receipts)',
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
  const [editModal, setEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    username: '',
    password: 'Volunteer@AMGM2026',
    department: 'मंडप व स्टेज व्यवस्था (Mandap & Stage)',
    role: 'volunteer'
  });

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    username: '',
    mobile: '',
    email: '',
    department: '',
    role: 'volunteer',
    password: ''
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

  const handleOpenEdit = (v) => {
    setSelectedUser(v);
    setEditForm({
      id: v.id || v._id,
      name: v.name || '',
      username: v.username || '',
      mobile: v.mobile || '',
      email: v.email || '',
      department: v.department || 'मंडप व स्टेज व्यवस्था (Mandap & Stage)',
      role: v.role || 'volunteer',
      password: ''
    });
    setEditModal(true);
  };

  const handleUpdateVolunteer = async (e) => {
    e.preventDefault();
    if (!editForm.name) {
      showError('कृपया पूर्ण नाव प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.put(`/volunteers/${editForm.id}`, editForm);
      if (res.success) {
        showSuccess(res.message || 'माहिती अद्यतनित झाली!');
        setEditModal(false);
        fetchVolunteers();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVolunteer = async (v) => {
    const isMainAdmin = v.role === 'super_admin' && v.username === 'admin';
    if (isMainAdmin) {
      showError('मुख्य ॲडमिन खाते हटवता येणार नाही.');
      return;
    }
    if (!window.confirm(`तुम्हाला नक्की "${v.name}" यांचे खाते हटवायचे आहे का?`)) {
      return;
    }
    try {
      const res = await api.delete(`/volunteers/${v.id || v._id}`);
      if (res.success) {
        showSuccess(res.message || 'कार्यकर्ता हटवला गेला.');
        fetchVolunteers();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            मंडळ कार्यकर्ते व पदाधिकारी (Volunteers & Karyakarta)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण सक्रिय कार्यकर्ते व पदाधिकारी: {volunteers.length}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => setAddModal(true)} className="btn btn-primary">
            ➕ नवीन कार्यकर्ता जोडा
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : volunteers.length === 0 ? (
        <EmptyState title="कोणताही कार्यकर्ता आढळला नाही" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {volunteers.map((v) => (
            <div key={v.id || v._id} className="amgm-card amgm-card-gold" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: v.role === 'super_admin' ? 'linear-gradient(135deg, #FFD700, #E65100)' : 'linear-gradient(135deg, #800000, #E65100)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {v.name ? v.name.charAt(0) : 'क'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', fontWeight: 800 }}>{v.name}</h3>
                    <span className="badge badge-primary">{v.role}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    onClick={() => handleOpenEdit(v)} 
                    className="btn btn-sm btn-outline"
                    title="माहिती बदला (Edit)"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                  >
                    ✏️ बदला
                  </button>
                  {!(v.role === 'super_admin' && v.username === 'admin') && (
                    <button 
                      onClick={() => handleDeleteVolunteer(v)} 
                      className="btn btn-sm btn-ghost"
                      title="हटवा (Delete)"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#DC2626' }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                <div>👤 युजरनेम: <b>{v.username || '-'}</b></div>
                <div>🏢 विभाग: <b>{v.department}</b></div>
                <div>📞 फोन: <b>{v.mobile || '-'}</b></div>
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
              placeholder="उदा. श्री. राहुल पाटील"
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

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title={`कार्यकर्ता / पदाधिकारी माहिती बदला`}>
        <form onSubmit={handleUpdateVolunteer}>
          <div className="form-group">
            <label className="form-label">पूर्ण नाव (Full Name / Admin Name) *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="form-input"
              placeholder="उदा. श्री. अमरनाथ पाटील किंवा तुमचे नाव"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">वापरकर्तानाव (Username)</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="form-input"
                placeholder="उदा. admin किंवा नाव"
              />
            </div>
            <div className="form-group">
              <label className="form-label">मोबाईल नंबर (Mobile)</label>
              <input
                type="tel"
                value={editForm.mobile}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                className="form-input"
                placeholder="१० अंकी मोबाईल नंबर"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">भूमिका (Role)</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="form-select"
                disabled={selectedUser?.role === 'super_admin' && selectedUser?.username === 'admin'}
              >
                <option value="super_admin">मुख्य प्रशासक (Super Admin)</option>
                <option value="treasurer">खजिनदार (Treasurer)</option>
                <option value="receipt_manager">पावती प्रमुख (Receipt Manager)</option>
                <option value="event_manager">कार्यक्रम प्रमुख (Event Manager)</option>
                <option value="volunteer">कार्यकर्ता (Volunteer)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">विभाग (Department)</label>
              <select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="form-select"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">नवीन पासवर्ड (बदलायचा असल्यास प्रविष्ट करा)</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className="form-input"
              placeholder="पासवर्ड बदलायचा नसल्यास रिकामे ठेवा"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setEditModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'जतन होत आहे...' : '💾 जतन करा (Save Changes)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VolunteersPage;
