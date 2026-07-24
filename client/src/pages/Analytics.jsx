/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Card, Spinner, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getExpenses, getRevenues } from '../api/expenses';

const PIE_COLORS = ['#3FA34D', '#5BC76B', '#A7F3D0', '#FACC15', '#EF4444', '#94A3B8'];

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Analytics() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([getExpenses(userId), getRevenues(userId)])
      .then(([exp, rev]) => {
        setExpenses(exp || []);
        setRevenues(rev || []);
      })
      .catch(() => toast.error('Failed to load analytics data.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const key = monthKey(e.date);
      map[key] = map[key] || { month: key, expense: 0, revenue: 0 };
      map[key].expense += e.amount || 0;
    });
    revenues.forEach((r) => {
      const key = monthKey(r.date);
      map[key] = map[key] || { month: key, expense: 0, revenue: 0 };
      map[key].revenue += r.amount || 0;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [expenses, revenues]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const key = e.category || 'Other';
      map[key] = (map[key] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalRevenue = revenues.reduce((s, r) => s + (r.amount || 0), 0);
  const avgMonthlyProfit = monthlyData.length
    ? (totalRevenue - totalExpense) / monthlyData.length
    : 0;

  if (loading) return <Spinner label="Crunching numbers..." />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Analytics</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Monthly trends and category breakdowns from your financial data.</p>
      </div>

      <div className="page-grid-sm" style={{ marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={totalRevenue} color="var(--success)" />
        <StatCard label="Total Expenses" value={totalExpense} color="var(--error)" />
        <StatCard label="Avg. Monthly Profit" value={Math.round(avgMonthlyProfit)} color="var(--primary)" icon={TrendingUp} />
      </div>

      {monthlyData.length === 0 ? (
        <EmptyState icon={BarChart3} title="Not enough data yet" description="Add expenses and revenue to see trends here." />
      ) : (
        <>
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Monthly Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="var(--error)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {categoryBreakdown.length > 0 && (
            <Card>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Expense Breakdown by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(d) => d.name}>
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <Card>
      <p style={{ color: 'var(--muted)', fontSize: 12.5, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color, display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={17} />}
        ₹{value.toLocaleString()}
      </p>
    </Card>
  );
}
