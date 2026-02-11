import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface AdminTopBarProps {
  onMenuToggle: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuToggle }) => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-brand-taupe/10">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-brand-nude transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-brand-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Spacer for mobile */}
        <div className="lg:hidden flex-1" />

        {/* Admin info & actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-brand-charcoal">Admin User</p>
            <p className="text-xs text-brand-charcoal/60">{user?.email || 'Loading...'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-brand-charcoal bg-brand-ivory rounded-xl hover:bg-brand-nude transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
