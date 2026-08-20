import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import FestivalModal from '../../components/common/FestivalModal';

const MandalHubPage = () => {
  const { user, logout, hasRole } = useAuth();
  const { config, activeFestival } = useConfig();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [festModalOpen, setFestModalOpen] = useState(false);
  const mandalCode = 'MND-AMGM';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mandalCode);
    showSuccess(`मंडळ कोड '${mandalCode}' कॉपी झाला!`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return 'SUPERADMIN';
      case 'treasurer': return 'TREASURER / खजिनदार';
      case 'receipt_manager': return 'RECEIPT MGR';
      case 'event_manager': return 'EVENT MGR';
      case 'volunteer': return 'WORKER / कार्यकर्ता';
      default: return (role || 'MEMBER').toUpperCase();
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* 1. MANDAL PROFILE HEADER CARD (Matching Screenshots 1 & 2) */}
      <div className="mandal-profile-header-card">
        <div className="mandal-avatar-circle">
          Sa
        </div>
        <h2 className="mandal-hub-title">{config.mandalName}</h2>
        <div style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '1rem' }}>
          {config.mandalTagline}
        </div>

        {/* Mandal Join Code Banner */}
        <div className="mandal-code-banner">
          <div>
            मंडळ कोड: <span className="mandal-code-tag">{mandalCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
          >
            📋 कॉपी
          </button>
        </div>
      </div>

      {/* 2. MANDAL MANAGEMENT MENU LIST (Matching Screenshots 1 & 2) */}
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
        मंडळ
      </div>
      <div className="mandal-hub-menu-card">
        <Link to="/admin/settings" className="mandal-hub-menu-item">
          <div className="mandal-menu-left">
            <span className="mandal-menu-icon">🏢</span>
            <span>मंडळाची माहिती व पावती</span>
          </div>
          <span className="mandal-menu-arrow">›</span>
        </Link>

        <Link to="/admin/members" className="mandal-hub-menu-item">
          <div className="mandal-menu-left">
            <span className="mandal-menu-icon">👥</span>
            <span>सदस्य व जॉइन कोड</span>
          </div>
          <span className="mandal-menu-arrow">›</span>
        </Link>

        <div
          className="mandal-hub-menu-item"
          onClick={() => setFestModalOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="mandal-menu-left">
            <span className="mandal-menu-icon">📚</span>
            <span>उत्सव सांभाळा</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#C2410C', fontWeight: 700 }}>
              {activeFestival?.name || 'गणेशोत्सव'}
            </span>
            <span className="mandal-menu-arrow">›</span>
          </div>
        </div>

        <Link to="/admin/documents" className="mandal-hub-menu-item">
          <div className="mandal-menu-left">
            <span className="mandal-menu-icon">📁</span>
            <span>कागदपत्रं (Documents)</span>
          </div>
          <span className="mandal-menu-arrow">›</span>
        </Link>

        <Link to="/admin/ledger" className="mandal-hub-menu-item">
          <div className="mandal-menu-left">
            <span className="mandal-menu-icon">📜</span>
            <span>नोंदवही (General Ledger)</span>
          </div>
          <span className="mandal-menu-arrow">›</span>
        </Link>
      </div>

      {/* 3. APP & ADMIN SETTINGS MENU */}
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
        ॲप व खातं
      </div>
      <div className="mandal-hub-menu-card">
        {hasRole(['super_admin']) && (
          <Link to="/admin/audit-logs" className="mandal-hub-menu-item">
            <div className="mandal-menu-left">
              <span className="mandal-menu-icon">🛡️</span>
              <span>ऑडिट लॉग्स (सुरक्षा व बदल ट्रेल)</span>
            </div>
            <span className="mandal-menu-arrow">›</span>
          </Link>
        )}

        {hasRole(['super_admin']) && (
          <Link to="/admin/users" className="mandal-hub-menu-item">
            <div className="mandal-menu-left">
              <span className="mandal-menu-icon">🔑</span>
              <span>वापरकर्ते व परवानग्या</span>
            </div>
            <span className="mandal-menu-arrow">›</span>
          </Link>
        )}

        <Link to="/admin/receipts" className="mandal-hub-menu-item">
          <div className="mandal-menu-left">
            <span className="mandal-menu-icon">💬</span>
            <span>WhatsApp पावत्या व्यवस्थापन</span>
          </div>
          <span className="mandal-menu-arrow">›</span>
        </Link>

        <Link to="/contact" className="mandal-hub-menu-item">
          <div className="mandal-menu-left">
            <span className="mandal-menu-icon">📞</span>
            <span>मदत व संपर्क</span>
          </div>
          <span className="mandal-menu-arrow">›</span>
        </Link>
      </div>

      {/* 4. USER PROFILE & SIGN OUT (Matching Screenshot 2 bottom) */}
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
        तुम्ही
      </div>
      <div className="mandal-hub-menu-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <strong style={{ fontSize: '1rem', color: '#1C1917' }}>{user?.name}</strong>
            <div style={{ fontSize: '0.8rem', color: '#78716C' }}>{user?.email || user?.username}</div>
          </div>
          <span className="role-badge-tag" style={{ background: '#FFF7ED', color: '#C2410C', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            {getRoleBadge(user?.role)}
          </span>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#A8A29E', marginBottom: '1rem' }}>
          Shree Amar Ganesh Portal v1.43.1 · 2026-08-20
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ width: '100%', color: '#DC2626', borderColor: '#FCA5A5', padding: '0.75rem', fontWeight: 700 }}
        >
          🚪 [→ साइन आउट (Sign Out)
        </button>
      </div>

      {/* Festival Selector Modal */}
      <FestivalModal
        isOpen={festModalOpen}
        onClose={() => setFestModalOpen(false)}
      />

    </div>
  );
};

export default MandalHubPage;
