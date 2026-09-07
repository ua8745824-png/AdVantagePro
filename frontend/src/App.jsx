import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LiveThemeCustomizer from './components/common/LiveThemeCustomizer';
import LiveThemeToggle from './components/common/LiveThemeToggle';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import FaqPage from './pages/public/FaqPage';
import ContactPage from './pages/public/ContactPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Portal Pages
import UserDashboard from './pages/portal/UserDashboard';
import UserTasks from './pages/portal/UserTasks';
import UserWallet from './pages/portal/UserWallet';
import UserDeposit from './pages/portal/UserDeposit';
import UserWithdraw from './pages/portal/UserWithdraw';
import UserReferrals from './pages/portal/UserReferrals';
import UserSupport from './pages/portal/UserSupport';
import UserNotifications from './pages/portal/UserNotifications';
import UserProfile from './pages/portal/UserProfile';

// Admin Console Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminTasks from './pages/admin/AdminTasks';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminAdjustments from './pages/admin/AdminAdjustments';
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods';
import AdminSupport from './pages/admin/AdminSupport';
import AdminFraud from './pages/admin/AdminFraud';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <Router>
                <Routes>
                  {/* 1. Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  {/* 2. User Portal Protected Routes */}
                  <Route
                    path="/portal"
                    element={
                      <ProtectedRoute>
                        <UserLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<UserDashboard />} />
                    <Route path="tasks" element={<UserTasks />} />
                    <Route path="wallet" element={<UserWallet />} />
                    <Route path="deposit" element={<UserDeposit />} />
                    <Route path="withdraw" element={<UserWithdraw />} />
                    <Route path="referrals" element={<UserReferrals />} />
                    <Route path="support" element={<UserSupport />} />
                    <Route path="notifications" element={<UserNotifications />} />
                    <Route path="profile" element={<UserProfile />} />
                  </Route>

                  {/* 3. Admin Console Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRoles={['SuperAdmin', 'Admin', 'FinanceAdmin', 'SupportAgent']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="campaigns" element={<AdminCampaigns />} />
                    <Route path="tasks" element={<AdminTasks />} />
                    <Route path="deposits" element={<AdminDeposits />} />
                    <Route path="withdrawals" element={<AdminWithdrawals />} />
                    <Route path="adjustments" element={<AdminAdjustments />} />
                    <Route path="payment-methods" element={<AdminPaymentMethods />} />
                    <Route path="support" element={<AdminSupport />} />
                    <Route path="fraud" element={<AdminFraud />} />
                    <Route path="audit-logs" element={<AdminAuditLogs />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Catch-all redirect to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
              {/* Global Live Theme Widgets */}
              <LiveThemeToggle />
              <LiveThemeCustomizer />
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
