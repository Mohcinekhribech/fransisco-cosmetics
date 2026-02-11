import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import LoadingSpinner from './LoadingSpinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading while checking auth (ProtectedRoute handles redirects)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-ivory">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ProtectedRoute ensures we only get here if authenticated and Admin
  // But add a safety check anyway
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-ivory/30">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <AdminTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
