import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
  } from 'recharts';
  import type { Transaction } from '../api/transactions';
  
  const COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#f87171', '#a78bfa', '#fb923c', '#34d399', '#60a5fa'];
  
  interface Props {
    transactions: Transaction[];
  }
  
  export function DashboardCharts({ transactions }: Props) {
    // Group expenses by category
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'Expense')
      .forEach((t) => {
        categoryTotals[t.categoryName] = (categoryTotals[t.categoryName] || 0) + t.amount;
      });
  
    const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  
    // Income vs Expense totals
    const totalIncome = transactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const barData = [
      { name: 'Income', amount: totalIncome },
      { name: 'Expense', amount: totalExpense },
    ];
  
    if (transactions.length === 0) {
      return null;
    }
  
    return (
      <div className="charts-grid">
        <div className="dashboard-panel">
          <h2>Spending by category</h2>
          {pieData.length === 0 ? (
            <p className="empty-state">No expenses yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a2540', border: '1px solid #2a3655', borderRadius: 8 }}
                  formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}                />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
  
        <div className="dashboard-panel">
          <h2>Income vs. expense</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3655" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1a2540', border: '1px solid #2a3655', borderRadius: 8 }}
                formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#f87171" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }