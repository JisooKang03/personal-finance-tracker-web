import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { getAccounts } from '../api/accounts';
import { getTransactions } from '../api/transactions';
import { getBudgets } from '../api/budgets';
import type { Account } from '../api/accounts';
import type { Transaction } from '../api/transactions';
import type { Budget } from '../api/budgets';

export function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    Promise.all([
      getAccounts(),
      getTransactions(),
      getBudgets(currentMonth, currentYear),
    ])
      .then(([accountsData, transactionsData, budgetsData]) => {
        setAccounts(accountsData);
        setTransactions(transactionsData.slice(0, 5)); // 5 most recent
        setBudgets(budgetsData);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  if (loading) {
    return (
      <Layout>
        <p className="loading-text">Loading dashboard...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="error-text">{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your financial overview at a glance</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Total balance</span>
          <span className="summary-value">${totalBalance.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Accounts</span>
          <span className="summary-value">{accounts.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Active budgets</span>
          <span className="summary-value">{budgets.length}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h2>Recent transactions</h2>
          {transactions.length === 0 ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <ul className="transaction-list">
              {transactions.map((t) => (
                <li key={t.id}>
                  <div>
                    <span className="tx-description">
                      {t.description || t.categoryName}
                    </span>
                    <span className="tx-meta">
                      {t.accountName} · {new Date(t.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`tx-amount ${t.type === 'Income' ? 'income' : 'expense'}`}>
                    {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-panel">
          <h2>Budget progress</h2>
          {budgets.length === 0 ? (
            <p className="empty-state">No budgets set for this month.</p>
          ) : (
            <ul className="budget-list">
              {budgets.map((b) => {
                const percent = Math.min((b.amountSpent / b.monthlyLimit) * 100, 100);
                const isOver = b.amountSpent > b.monthlyLimit;
                return (
                  <li key={b.id}>
                    <div className="budget-row">
                      <span>{b.categoryName}</span>
                      <span className={isOver ? 'over-budget' : ''}>
                        ${b.amountSpent.toFixed(2)} / ${b.monthlyLimit.toFixed(2)}
                      </span>
                    </div>
                    <div className="budget-bar">
                      <div
                        className={`budget-bar-fill ${isOver ? 'over' : ''}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}