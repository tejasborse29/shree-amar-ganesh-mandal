import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

const AdminLayout = () => {
  const { user, logout, hasRole, isSuperAdmin } = useAuth();
  const { config } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'डॅशबोर्ड (Dashboard)', path: '/admin/dashboard', icon: '📊', roles: [] },
    { name: 'सभासद / देणगीदार (Members)', path: '/admin/members', icon: '👥', roles: ['super_admin', 'treasurer', 'receipt_manager'] },
    { name: 'डिजिटल पावत्या (Receipts)', path: '/admin/receipts', icon: '🧾', roles: ['super_admin', 'treasurer', 'receipt_manager'] },
    { name: 'जमा नोंदी (Income)', path: '/admin/income', icon: '💰', roles: ['super_admin', 'treasurer'] },
    { name: 'खर्च व्यवस्थापन (Expenses)', path: '/admin/expenses', icon: '💸', roles: ['super_admin', 'treasurer'] },
    { name: 'कार्यकर्ते (Volunteers)', path: '/admin/volunteers', icon: '🤝', roles: ['super_admin'] },
    { name: 'कामकाज (Tasks)', path: '/admin/tasks', icon: '📋', roles: [] },
    { name: 'कार्यक्रम व्यवस्थापन (Events)', path: '/admin/events', icon: '📅', roles: ['super_admin', 'event_manager'] },
    { name: 'फोटो गॅलरी (Gallery)', path: '/admin/gallery', icon: '🖼️', roles: ['super_admin', 'event_manager'] },
    { name: 'सूचना व फलक (Announcements)', path: '/admin/announcements', icon: '📢', roles: ['super_admin', 'event_manager'] },
    { name: 'सामाजिक उपक्रम (Social)', path: '/admin/social', icon: '🌱', roles: ['super_admin', 'event_manager'] },
    { name: 'आर्थिक अहवाल (Reports)', path: '/admin/reports', icon: '📑', roles: ['super_admin', 'treasurer'] },
    { name: 'ऑडिट लॉग्स (Audit Trail)', path: '/admin/audit-logs', icon: '🛡️', roles: ['super_admin'] },
    { name: 'वापरकर्ते व परवानग्या (Users)', path: '/admin/users', icon: '🔑', roles: ['super_admin'] },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="admin-mobile-toggle" onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}>
              ☰
            </button>
            <h1 className="admin-header-title">
              {allowedNav.find((n) => n.path === location.pathname)?.name || 'व्यवस्थापन पॅनल'}
            </h1>
          </div>

          <div className="admin-header-actions">
            <span className="role-badge-pill">👤 {user?.name} ({getRoleLabel(user?.role)})</span>
            <Link to="/" className="btn btn-outline btn-sm">
              🌐 मुख्य वेबसाइट
            </Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              बाहेर पडा
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content-body">
          <Outlet />
        </div>

        {/* Mobile Bottom Quick Navigation */}
        <div className="admin-mobile-bottom-bar">
          <Link to="/admin/dashboard" className={`bottom-nav-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
            <span className="bottom-nav-icon">📊</span>
            <span>डॅशबोर्ड</span>
          </Link>
          {hasRole(['super_admin', 'treasurer', 'receipt_manager']) && (
            <Link to="/admin/receipts" className={`bottom-nav-item ${location.pathname === '/admin/receipts' ? 'active' : ''}`}>
              <span className="bottom-nav-icon">🧾</span>
              <span>पावत्या</span>
            </Link>
          )}
          {hasRole(['super_admin', 'treasurer', 'receipt_manager']) && (
            <Link to="/admin/members" className={`bottom-nav-item ${location.pathname === '/admin/members' ? 'active' : ''}`}>
              <span className="bottom-nav-icon">👥</span>
              <span>सभासद</span>
            </Link>
          )}
          <Link to="/admin/tasks" className={`bottom-nav-item ${location.pathname === '/admin/tasks' ? 'active' : ''}`}>
            <span className="bottom-nav-icon">📋</span>
            <span>कामे</span>
          </Link>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="bottom-nav-item"
            style={{ background: 'transparent', border: 'none' }}
          >
            <span className="bottom-nav-icon">⚡</span>
            <span>अधिक</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
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
