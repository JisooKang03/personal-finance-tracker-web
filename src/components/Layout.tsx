import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/accounts', label: 'Accounts' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/budgets', label: 'Budgets' },
  ];

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <span className="logo">PFT</span>
        </div>

        <div className="sidebar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.fullName}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sign out
          </button>
        </div>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
}