import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { CardSkeleton } from '../components/Skeleton';
import { getCategories } from '../api/categories';
import { getBudgets, createBudget, deleteBudget } from '../api/budgets';
import type { Category } from '../api/categories';
import type { Budget } from '../api/budgets';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([getBudgets(month, year), getCategories()])
      .then(([b, c]) => {
        setBudgets(b);
        setCategories(c.filter((cat) => cat.type === 'Expense'));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setError('Your session expired. Please sign in again.');
        } else if (!err.response) {
          setError('Cannot reach the server. Is the API running?');
        } else {
          setError('Something went wrong loading your budgets.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createBudget({
        categoryId: parseInt(categoryId),
        monthlyLimit: parseFloat(monthlyLimit),
        month,
        year,
      });
      setCategoryId('');
      setMonthlyLimit('');
      setShowForm(false);
      loadData();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('A budget for this category and month already exists.');
      } else {
        setError('Failed to create budget.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
      loadData();
    } catch {
      setError('Failed to delete budget.');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Budgets</h1>
        <p>Set monthly spending limits by category</p>
      </div>

      <div className="month-picker">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          {MONTH_NAMES.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New budget'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="inline-form">
          <div className="form-row">
            <label htmlFor="category">Category</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="limit">Monthly limit</label>
            <input
              id="limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create budget'}
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
      ) : budgets.length === 0 ? (
        <p className="empty-state">No budgets set for {MONTH_NAMES[month - 1]} {year}.</p>
      ) : (
        <div className="budget-grid">
          {budgets.map((b) => {
            const percent = Math.min((b.amountSpent / b.monthlyLimit) * 100, 100);
            const isOver = b.amountSpent > b.monthlyLimit;
            return (
              <div key={b.id} className="budget-card">
                <div className="budget-card-header">
                  <span className="account-name">{b.categoryName}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(b.id)}
                    aria-label={`Delete ${b.categoryName} budget`}
                  >
                    ×
                  </button>
                </div>
                <div className="budget-row">
                  <span className={isOver ? 'over-budget' : ''}>
                    ${b.amountSpent.toFixed(2)} spent
                  </span>
                  <span>of ${b.monthlyLimit.toFixed(2)}</span>
                </div>
                <div className="budget-bar">
                  <div
                    className={`budget-bar-fill ${isOver ? 'over' : ''}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="account-date">
                  {isOver
                    ? `$${(b.amountSpent - b.monthlyLimit).toFixed(2)} over budget`
                    : `$${b.remainingAmount.toFixed(2)} remaining`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}