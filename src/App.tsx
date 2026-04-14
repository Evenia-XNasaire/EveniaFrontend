import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import { motion } from 'framer-motion';
import StatsPage from './pages/StatsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import ProfilePage from './pages/ProfilePage';
import OrganizerEventDetailsPage from './pages/OrganizerEventDetailsPage';
import OrganizerWalletPage from './pages/OrganizerWalletPage';
import HistoryPage from './pages/HistoryPage';
import GuidePage from './pages/GuidePage';
import StaffManagementPage from './pages/StaffManagementPage';
import ScannerPage from './pages/ScannerPage';
import NotificationsPage from './pages/NotificationsPage';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminWalletPage from './pages/AdminWalletPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStatsPage from './pages/AdminStatsPage';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
      <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/history" element={<HistoryPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="/organizer/events" element={<OrganizerDashboard />} />
      <Route path="/organizer/events/:id" element={<OrganizerEventDetailsPage />} />
      <Route path="/organizer/stats" element={<StatsPage />} />
      <Route path="/organizer/create" element={<CreateEventPage />} />
      <Route path="/organizer/edit/:id" element={<EditEventPage />} />
      <Route path="/organizer/staff" element={<StaffManagementPage />} />
      <Route path="/scanner" element={<ScannerPage />} />
      <Route path="/my-tickets" element={<ClientDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/stats" element={<AdminStatsPage />} />
      <Route path="/admin/wallet" element={<AdminWalletPage />} />
      <Route path="/admin/events" element={<AdminEventsPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/organizer/wallet" element={<OrganizerWalletPage />} />
      <Route path="/guide" element={<MainLayout><GuidePage /></MainLayout>} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/organizer/register" element={<MainLayout><RegisterPage /></MainLayout>} />
      <Route path="/how-it-works" element={<MainLayout><GuidePage /></MainLayout>} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
