import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { getAccounts, createAccount, deleteAccount } from '../api/accounts';
import type { Account } from '../api/accounts';

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = () => {
    setLoading(true);
    getAccounts()
      .then(setAccounts)
      .catch(() => setError('Failed to load accounts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAccount(name, parseFloat(balance) || 0);
      setName('');
      setBalance('');
      setShowForm(false);
      loadAccounts();
    } catch {
      setError('Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this account? This cannot be undone.')) return;
    try {
      await deleteAccount(id);
      loadAccounts();
    } catch {
      setError('Failed to delete account.');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Accounts</h1>
        <p>Manage your checking, savings, and other accounts</p>
      </div>

      <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New account'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="inline-form">
          <div className="form-row">
            <label htmlFor="name">Account name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="balance">Starting balance</label>
            <input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </div>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create account'}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="loading-text">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p className="empty-state">No accounts yet. Create your first one above.</p>
      ) : (
        <div className="account-grid">
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-card-header">
                <span className="account-name">{account.name}</span>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(account.id)}
                  aria-label={`Delete ${account.name}`}
                >
                  ×
                </button>
              </div>
              <span className="account-balance">${account.balance.toFixed(2)}</span>
              <span className="account-date">
                Created {new Date(account.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}