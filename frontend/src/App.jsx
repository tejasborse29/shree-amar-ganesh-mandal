import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfigProvider } from './context/ConfigContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import EventsPage from './pages/public/EventsPage';
import VarganiPage from './pages/public/VarganiPage';
import GalleryPage from './pages/public/GalleryPage';
import SocialActivitiesPage from './pages/public/SocialActivitiesPage';
import TransparencyPage from './pages/public/TransparencyPage';
import ContactPage from './pages/public/ContactPage';
import ReceiptVerifyPage from './pages/public/ReceiptVerifyPage';
import CommitteeLoginPage from './pages/public/CommitteeLoginPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import MandalHubPage from './pages/admin/MandalHubPage';
import DocumentsPage from './pages/admin/DocumentsPage';
import LedgerPage from './pages/admin/LedgerPage';
import MembersPage from './pages/admin/MembersPage';
import ReceiptsPage from './pages/admin/ReceiptsPage';
import IncomePage from './pages/admin/IncomePage';
import ExpensesPage from './pages/admin/ExpensesPage';
import VolunteersPage from './pages/admin/VolunteersPage';
import TasksPage from './pages/admin/TasksPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminSocialPage from './pages/admin/AdminSocialPage';
import ReportsPage from './pages/admin/ReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import UsersPage from './pages/admin/UsersPage';
import SettingsPage from './pages/admin/SettingsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 700 }}>
          लोड होत आहे... 🙏
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/committee/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfigProvider>
          <AuthProvider>
            <Routes>
              
              {/* Public Portal Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="programs" element={<EventsPage />} />
                <Route path="vargani" element={<VarganiPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="social-activities" element={<SocialActivitiesPage />} />
                <Route path="transparency" element={<TransparencyPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="verify/:receiptNumber" element={<ReceiptVerifyPage />} />
                <Route path="committee/login" element={<CommitteeLoginPage />} />
              </Route>

              {/* Protected Admin / Committee Management Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="mandal-hub" element={<MandalHubPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="ledger" element={<ProtectedRoute allowedRoles={['super_admin', 'treasurer']}><LedgerPage /></ProtectedRoute>} />
                
                {/* Specific Management Modules */}
                <Route path="members" element={<ProtectedRoute allowedRoles={['super_admin', 'treasurer', 'receipt_manager']}><MembersPage /></ProtectedRoute>} />
                <Route path="receipts" element={<ProtectedRoute allowedRoles={['super_admin', 'treasurer', 'receipt_manager']}><ReceiptsPage /></ProtectedRoute>} />
                <Route path="income" element={<ProtectedRoute allowedRoles={['super_admin', 'treasurer']}><IncomePage /></ProtectedRoute>} />
                <Route path="expenses" element={<ProtectedRoute allowedRoles={['super_admin', 'treasurer']}><ExpensesPage /></ProtectedRoute>} />
                <Route path="volunteers" element={<ProtectedRoute allowedRoles={['super_admin']}><VolunteersPage /></ProtectedRoute>} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="events" element={<ProtectedRoute allowedRoles={['super_admin', 'event_manager']}><AdminEventsPage /></ProtectedRoute>} />
                <Route path="gallery" element={<ProtectedRoute allowedRoles={['super_admin', 'event_manager']}><AdminGalleryPage /></ProtectedRoute>} />
                <Route path="announcements" element={<ProtectedRoute allowedRoles={['super_admin', 'event_manager']}><AdminAnnouncementsPage /></ProtectedRoute>} />
                <Route path="social" element={<ProtectedRoute allowedRoles={['super_admin', 'event_manager']}><AdminSocialPage /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRoles={['super_admin', 'treasurer']}><ReportsPage /></ProtectedRoute>} />
                <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['super_admin']}><AuditLogsPage /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute allowedRoles={['super_admin']}><UsersPage /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute allowedRoles={['super_admin']}><SettingsPage /></ProtectedRoute>} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </AuthProvider>
        </ConfigProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
