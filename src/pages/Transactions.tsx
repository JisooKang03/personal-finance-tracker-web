import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { CardSkeleton } from '../components/Skeleton';
import { getAccounts } from '../api/accounts';
import { getCategories } from '../api/categories';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  uploadReceipt,
  getReceiptUrl,
} from '../api/transactions';
import type { Account } from '../api/accounts';
import type { Category } from '../api/categories';
import type { Transaction } from '../api/transactions';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([getTransactions(), getAccounts(), getCategories()])
      .then(([tx, acc, cat]) => {
        setTransactions(tx);
        setAccounts(acc);
        setCategories(cat);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setError('Your session expired. Please sign in again.');
        } else if (!err.response) {
          setError('Cannot reach the server. Is the API running?');
        } else {
          setError('Something went wrong loading your transactions.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTransaction({
        accountId: parseInt(accountId),
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        type,
        description: description || undefined,
        date: new Date(date).toISOString(),
      });
      setAccountId('');
      setCategoryId('');
      setAmount('');
      setDescription('');
      setShowForm(false);
      loadData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have access to that account.');
      } else if (err.response?.status === 400) {
        setError('Please check the category and amount and try again.');
      } else {
        setError('Failed to create transaction.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      loadData();
    } catch {
      setError('Failed to delete transaction.');
    }
  };

  const handleFileChange = async (id: number, file: File | null) => {
    if (!file) return;
    setUploadingId(id);
    try {
      await uploadReceipt(id, file);
      loadData();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid file. Use JPEG, PNG, or WebP under 5MB.');
      } else {
        setError('Failed to upload receipt.');
      }
    } finally {
      setUploadingId(null);
    }
  };

  const handleViewReceipt = async (id: number) => {
    try {
      const { url } = await getReceiptUrl(id);
      window.open(url, '_blank');
    } catch {
      setError('Failed to load receipt.');
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Layout>
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Track your income and expenses</p>
      </div>

      <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New transaction'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="inline-form">
          <div className="form-row">
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as 'Income' | 'Expense')}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="account">Account</label>
            <select id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="category">Category</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select category</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row form-row-wide">
            <label htmlFor="description">Description (optional)</label>
            <input
              id="description"
              type="text"
              placeholder="e.g. Weekly groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add transaction'}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="skeleton-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : transactions.length === 0 ? (
        <p className="empty-state">No transactions yet.</p>
      ) : (
        <div className="tx-table">
          {transactions.map((t) => (
            <div key={t.id} className="tx-row">
              <div className="tx-row-main">
                <span className="tx-description">{t.description || t.categoryName}</span>
                <span className="tx-meta">
                  {t.accountName} · {t.categoryName} · {new Date(t.date).toLocaleDateString()}
                </span>
              </div>

              <span className={`tx-amount ${t.type === 'Income' ? 'income' : 'expense'}`}>
                {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>

              <div className="tx-actions">
                {t.receiptUrl ? (
                  <button className="link-btn" onClick={() => handleViewReceipt(t.id)}>
                    View receipt
                  </button>
                ) : (
                  <label className="link-btn upload-label">
                    {uploadingId === t.id ? 'Uploading...' : 'Add receipt'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => handleFileChange(t.id, e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                <button className="delete-btn" onClick={() => handleDelete(t.id)} aria-label="Delete transaction">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}