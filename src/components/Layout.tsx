import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadProfilePhoto, getProfilePhotoUrl } from '../api/users';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfilePhotoUrl()
      .then((data) => setPhotoUrl(data.url))
      .catch(() => setPhotoUrl(null)); // no photo set yet, that's fine
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadProfilePhoto(file);
      setPhotoUrl(data.url);
    } catch {
      // Silently fail for now; photo upload isn't critical path
    } finally {
      setUploading(false);
    }
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/accounts', label: 'Accounts' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/budgets', label: 'Budgets' },
  ];

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="app-layout">
      <nav className="sidebar">
      <div className="sidebar-header">
  <span className="header-user-name">{user?.fullName}</span>
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
          <div className="sidebar-footer-top">
            <button className="avatar-btn" onClick={handlePhotoClick} disabled={uploading}>
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="avatar-img" />
              ) : (
                <span className="avatar-initials">{uploading ? '...' : initials}</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />

            <div className="user-info">
              <span className="user-name">{user?.fullName}</span>
              <span className="user-role">{user?.role}</span>
            </div>
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