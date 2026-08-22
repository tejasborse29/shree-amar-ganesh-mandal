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

const UsersPage = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    username: '',
    name: '',
    password: '',
    role: 'volunteer',
    department: 'General',
    mobile: '',
    email: ''
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.success) {
        setUsers(res.users);
      }
    } catch (e) {
      showError('वापरकर्ते लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.username || !form.name || !form.password) {
      showError('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/users', form);
      if (res.success) {
        showSuccess(res.message);
        setAddModal(false);
        setForm({ username: '', name: '', password: '', role: 'volunteer', department: 'General', mobile: '', email: '' });
        fetchUsers();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setEditForm({
      id: u.id || u._id,
      name: u.name || '',
      username: u.username || '',
      mobile: u.mobile || '',
      email: u.email || '',
      department: u.department || 'General',
      role: u.role || 'volunteer',
      password: ''
    });
    setEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editForm.name) {
      showError('कृपया नाव प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.put(`/users/${editForm.id}`, editForm);
      if (res.success) {
        showSuccess(res.message || 'वापरकर्ता अद्यतनित झाला!');
        setEditModal(false);
        fetchUsers();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.role === 'super_admin' && u.username === 'admin') {
      showError('मुख्य ॲडमिन खाते हटवता येणार नाही.');
      return;
    }
    if (!window.confirm(`तुम्हाला नक्की "${u.name}" यांचे खाते हटवायचे आहे का?`)) {
      return;
    }
    try {
      const res = await api.delete(`/users/${u.id || u._id}`);
      if (res.success) {
        showSuccess(res.message || 'वापरकर्ता हटवला गेला.');
        fetchUsers();
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
            वापरकर्ते व परवानग्या (Users & Roles)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            समिती पदाधिकारी व व्यवस्थापन लॉगिन खाती
          </p>
        </div>

        <button onClick={() => setAddModal(true)} className="btn btn-primary">
          ➕ नवीन वापरकर्ता खाते तयार करा
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : users.length === 0 ? (
        <EmptyState title="कोणताही वापरकर्ता आढळला नाही" />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>नाव</th>
                <th>वापरकर्तानाव (Username)</th>
                <th>भूमिका (Role)</th>
                <th>विभाग (Department)</th>
                <th>मोबाईल</th>
                <th>स्थिती</th>
                <th style={{ textAlign: 'center' }}>कृती (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id || u._id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{u.name}</td>
                  <td><code>{u.username}</code></td>
                  <td>
                    <span className="badge badge-primary">{u.role}</span>
                  </td>
                  <td>{u.department || 'General'}</td>
                  <td>{u.mobile || '-'}</td>
                  <td>
                    <span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive !== false ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => handleOpenEdit(u)} 
                      className="btn btn-sm btn-outline"
                      style={{ marginRight: '0.4rem', padding: '0.3rem 0.6rem' }}
                    >
                      ✏️ बदला
                    </button>
                    {!(u.role === 'super_admin' && u.username === 'admin') && (
                      <button 
                        onClick={() => handleDeleteUser(u)} 
                        className="btn btn-sm btn-ghost"
                        style={{ color: '#DC2626', padding: '0.3rem 0.6rem' }}
                      >
                        🗑️ हटवा
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="नवीन वापरकर्ता खाते तयार करा">
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">वापरकर्तानाव (Username) *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="form-input"
                placeholder="उदा. admin / rahul_p"
                required
              />
            </div>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                <option value="super_admin">मुख्य प्रशासक (Super Admin)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">विभाग (Department)</label>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">मोबाईल नंबर</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="form-input"
                placeholder="१० अंकी मोबाईल नंबर"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ईमेल (पर्यायी)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
                placeholder="user@shreeamarganesh.org"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">पासवर्ड *</label>
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
              {submitting ? 'तयार करत आहे...' : 'खाते तयार करा'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title={`वापरकर्ता माहिती बदला`}>
        <form onSubmit={handleUpdateUser}>
          <div className="form-group">
            <label className="form-label">पूर्ण नाव (Full Name) *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="form-input"
              placeholder="उदा. श्री. अमरनाथ पाटील"
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
                placeholder="उदा. admin"
              />
            </div>
            <div className="form-group">
              <label className="form-label">मोबाईल नंबर</label>
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

export default UsersPage;
