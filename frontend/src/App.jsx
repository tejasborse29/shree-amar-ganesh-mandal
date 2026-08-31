import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfigProvider } from './context/ConfigContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Eagerly loaded public entry pages
import HomePage from './pages/public/HomePage';
import CommitteeLoginPage from './pages/public/CommitteeLoginPage';
import AIChatBot from './components/common/AIChatBot';

// Lazy loaded public pages
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const EventsPage = lazy(() => import('./pages/public/EventsPage'));
const VarganiPage = lazy(() => import('./pages/public/VarganiPage'));
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'));
const SocialActivitiesPage = lazy(() => import('./pages/public/SocialActivitiesPage'));
const TransparencyPage = lazy(() => import('./pages/public/TransparencyPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const ReceiptVerifyPage = lazy(() => import('./pages/public/ReceiptVerifyPage'));

// Lazy loaded admin pages (Code splitting for high performance)
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/admin/TransactionsPage'));
const NotificationsPage = lazy(() => import('./pages/admin/NotificationsPage'));
const MandalHubPage = lazy(() => import('./pages/admin/MandalHubPage'));
const DocumentsPage = lazy(() => import('./pages/admin/DocumentsPage'));
const LedgerPage = lazy(() => import('./pages/admin/LedgerPage'));
const MembersPage = lazy(() => import('./pages/admin/MembersPage'));
const ReceiptsPage = lazy(() => import('./pages/admin/ReceiptsPage'));
const IncomePage = lazy(() => import('./pages/admin/IncomePage'));
const ExpensesPage = lazy(() => import('./pages/admin/ExpensesPage'));
const VolunteersPage = lazy(() => import('./pages/admin/VolunteersPage'));
const TasksPage = lazy(() => import('./pages/admin/TasksPage'));
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage'));
const AdminSocialPage = lazy(() => import('./pages/admin/AdminSocialPage'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Fallback component during page chunk load
const LoadingSpinner = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid #FDE047', borderTopColor: '#B91C1C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: '0.9rem', color: '#78716C', fontWeight: 600 }}>लोड होत आहे... 🙏</span>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
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
      <AuthProvider>
        <ConfigProvider>
          <ToastProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                
                {/* 1. PUBLIC PORTAL */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="vargani" element={<VarganiPage />} />
                  <Route path="gallery" element={<GalleryPage />} />
                  <Route path="social-activities" element={<SocialActivitiesPage />} />
                  <Route path="transparency" element={<TransparencyPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="verify/:receiptNumber" element={<ReceiptVerifyPage />} />
                  <Route path="committee/login" element={<CommitteeLoginPage />} />
                </Route>

                {/* 2. SECURE ADMIN PORTAL */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="mandal-hub" element={<MandalHubPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="ledger" element={<LedgerPage />} />
                  
                  {/* Receipts & Income */}
                  <Route path="receipts" element={<ReceiptsPage />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="income" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'treasurer', 'receipt_manager', 'event_manager', 'volunteer']}>
                      <IncomePage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Expenses */}
                  <Route path="expenses" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'treasurer', 'receipt_manager', 'event_manager', 'volunteer']}>
                      <ExpensesPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Volunteers & Operations */}
                  <Route path="volunteers" element={<VolunteersPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="events" element={<AdminEventsPage />} />
                  <Route path="gallery" element={<AdminGalleryPage />} />
                  <Route path="announcements" element={<AdminAnnouncementsPage />} />
                  <Route path="social" element={<AdminSocialPage />} />
                  
                  {/* Financial Reports */}
                  <Route path="reports" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'treasurer']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Administration */}
                  <Route path="audit-logs" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="users" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <UsersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* 3. FALLBACK */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </Suspense>
            <AIChatBot />
          </ToastProvider>
        </ConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
