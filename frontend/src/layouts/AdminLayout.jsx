import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import FestivalModal from '../components/common/FestivalModal';

const AdminLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const { config, activeFestival } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [festivalModalOpen, setFestivalModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'मुख्य डॅशबोर्ड', path: '/admin/dashboard', icon: '🏠', roles: [] },
    { name: 'सर्व नोंदी (Transactions)', path: '/admin/transactions', icon: '📋', roles: [] },
    { name: 'डिजिटल पावत्या (Receipts)', path: '/admin/receipts', icon: '🧾', roles: ['super_admin', 'treasurer', 'receipt_manager'] },
    { name: 'सभासद / देणगीदार (Members)', path: '/admin/members', icon: '👥', roles: ['super_admin', 'treasurer', 'receipt_manager'] },
    { name: 'जमा नोंदी (Income)', path: '/admin/income', icon: '💰', roles: ['super_admin', 'treasurer'] },
    { name: 'खर्च व्यवस्थापन (Expenses)', path: '/admin/expenses', icon: '💸', roles: ['super_admin', 'treasurer'] },
    { name: 'कागदपत्रं (Documents)', path: '/admin/documents', icon: '📁', roles: ['super_admin', 'treasurer', 'event_manager', 'secretary'] },
    { name: 'नोंदवही (General Ledger)', path: '/admin/ledger', icon: '📜', roles: ['super_admin', 'treasurer'] },
    { name: 'कार्यकर्ते (Volunteers)', path: '/admin/volunteers', icon: '🤝', roles: ['super_admin'] },
    { name: 'कामकाज (Tasks)', path: '/admin/tasks', icon: '✅', roles: [] },
    { name: 'कार्यक्रम व्यवस्थापन (Events)', path: '/admin/events', icon: '📅', roles: ['super_admin', 'event_manager'] },
    { name: 'फोटो गॅलरी (Gallery)', path: '/admin/gallery', icon: '🖼️', roles: ['super_admin', 'event_manager'] },
    { name: 'सूचना व फलक (Announcements)', path: '/admin/announcements', icon: '📢', roles: ['super_admin', 'event_manager'] },
    { name: 'सामाजिक उपक्रम (Social)', path: '/admin/social', icon: '🌱', roles: ['super_admin', 'event_manager'] },
    { name: 'आर्थिक अहवाल (Reports)', path: '/admin/reports', icon: '📊', roles: ['super_admin', 'treasurer'] },
    { name: 'ऑडिट लॉग्स (Audit Trail)', path: '/admin/audit-logs', icon: '🛡️', roles: ['super_admin'] },
    { name: 'वापरकर्ते व परवानग्या (Users)', path: '/admin/users', icon: '🔑', roles: ['super_admin'] },
    { name: 'मंडळ व्यवस्थापन केंद्र (Hub)', path: '/admin/mandal-hub', icon: '👑', roles: [] },
    { name: 'मंडळ सेटिंग्ज (Settings)', path: '/admin/settings', icon: '⚙️', roles: ['super_admin'] }
  ];

  const allowedNav = navItems.filter((item) => hasRole(item.roles));

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'treasurer': return 'खजिनदार / Treasurer';
      case 'receipt_manager': return 'पावती प्रमुख / Receipt Mgr';
      case 'event_manager': return 'कार्यक्रम प्रमुख / Event Mgr';
      case 'volunteer': return 'कार्यकर्ता / Volunteer';
      default: return role;
    }
  };

  return (
    <div className="admin-shell">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/assets/Mandal Logo.png" alt="Logo" className="sidebar-logo" />
          <div>
            <div className="sidebar-brand-title">समिती व्यवस्थापन</div>
            <div className="sidebar-brand-sub">{config.mandalName}</div>
          </div>
        </div>

        {/* Festival Switcher Pill in Sidebar */}
        <div style={{ padding: '0.75rem 1rem 0.25rem' }}>
          <button
            onClick={() => setFestivalModalOpen(true)}
            className="fest-header-pill"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>🚩 {activeFestival?.name || 'गणेशोत्सव'} ({activeFestival?.financialYear || '2026-27'})</span>
            <span style={{ fontSize: '0.75rem' }}>▼</span>
          </button>
        </div>

        <ul className="sidebar-menu">
          <div className="sidebar-category-label">मुख्य मेनू</div>
          {allowedNav.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-item-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setMobileDrawerOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-role">{getRoleLabel(user?.role)}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: '#EF4444' }} title="Logout">
            🚪 बाहेर पडा
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="admin-mobile-toggle" onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}>
              ☰
            </button>
            
            {/* Mobile Active Festival Selector Pill */}
            <button onClick={() => setFestivalModalOpen(true)} className="fest-header-pill">
              <span>🚩 {activeFestival?.name || 'गणेशोत्सव'} {activeFestival?.financialYear || '2026-27'}</span>
              <span style={{ fontSize: '0.7rem' }}>▼</span>
            </button>
          </div>

          <div className="admin-header-actions">
            <span className="role-badge-pill desktop-only">👤 {user?.name} ({getRoleLabel(user?.role)})</span>
            <Link to="/" className="btn btn-outline btn-sm">
              🌐 मुख्य वेबसाइट
            </Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm desktop-only">
              बाहेर पडा
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content-body">
          <Outlet />
        </div>

        {/* Mobile 5-Tab Bottom Navigation Bar (Matching MandalBook Reference) */}
        <div className="admin-mobile-bottom-bar">
          <Link
            to="/admin/dashboard"
            className={`bottom-nav-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">🏠</span>
            <span>मुख्य</span>
          </Link>

          <Link
            to="/admin/transactions"
            className={`bottom-nav-item ${location.pathname === '/admin/transactions' ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">📋</span>
            <span>नोंदी</span>
          </Link>

          <Link
            to="/admin/reports"
            className={`bottom-nav-item ${location.pathname === '/admin/reports' ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">📊</span>
            <span>अहवाल</span>
          </Link>

          <Link
            to="/admin/notifications"
            className={`bottom-nav-item ${location.pathname === '/admin/notifications' ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">🔔</span>
            <span>सूचना</span>
          </Link>

          <Link
            to="/admin/mandal-hub"
            className={`bottom-nav-item ${location.pathname === '/admin/mandal-hub' ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">👑</span>
            <span>मंडळ</span>
          </Link>
        </div>
      </div>

      {/* Festival Switcher Bottom Sheet Modal */}
      <FestivalModal
        isOpen={festivalModalOpen}
        onClose={() => setFestivalModalOpen(false)}
      />

      {/* Mobile Sidebar Drawer */}
      <div
        className={`mobile-drawer-overlay ${mobileDrawerOpen ? 'open' : ''}`}
        onClick={() => setMobileDrawerOpen(false)}
      >
        <div className={`mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <div className="brand-info">
              <span className="brand-name" style={{ fontSize: '1.1rem' }}>{config.mandalName}</span>
              <span className="brand-tagline">समिती व्यवस्थापन</span>
            </div>
            <button className="modal-close-btn" onClick={() => setMobileDrawerOpen(false)}>&times;</button>
          </div>

          <ul className="drawer-links">
            {allowedNav.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`drawer-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  {item.icon} {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="drawer-footer">
            <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
              🚪 बाहेर पडा (Logout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
