import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>404</h1>
        <p className="auth-subtitle" style={{ marginBottom: '1.75rem' }}>
          This page doesn't exist.
        </p>
        <Link to="/" className="primary-btn" style={{ display: 'inline-block', textDecoration: 'none', margin: 0 }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}