import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const UsersPage = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    name: '',
    password: '',
    role: 'volunteer',
    department: 'General',
    mobile: '',
    email: ''
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
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id || u._id}>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{u.username}</td>
                  <td><span className="badge badge-primary">{u.role}</span></td>
                  <td>{u.department || 'General'}</td>
                  <td>{u.mobile || '-'}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>
                      {u.isActive ? 'सक्रिय (Active)' : 'निष्क्रिय'}
                    </span>
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
          <div className="form-group">
            <label className="form-label">पूर्ण नाव (Full Name) *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              placeholder="उदा. श्री. सचिन जोशी"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">वापरकर्तानाव (Username) *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="form-input"
                placeholder="उदा. treasurer"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">पासवर्ड (Password) *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="form-input"
                placeholder="पासवर्ड"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">भूमिका (Role) *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="form-select"
              >
                <option value="volunteer">कार्यकर्ता (Volunteer)</option>
                <option value="receipt_manager">पावती प्रमुख (Receipt Manager)</option>
                <option value="event_manager">कार्यक्रम प्रमुख (Event Manager)</option>
                <option value="treasurer">खजिनदार (Treasurer)</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">विभाग (Department)</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="form-input"
                placeholder="हिशोब व वित्त"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setAddModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'तयार होत आहे...' : 'खाते तयार करा'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
