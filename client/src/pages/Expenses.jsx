/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, Button, Input, Select, FormField, EmptyState, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addExpense, addRevenue, clearFinancials, getExpenses, getRevenues } from '../api/expenses';

const CATEGORIES = ['Seeds', 'Fertilizer', 'Fuel', 'Labor', 'Equipment', 'Irrigation', 'Other'];

export default function Expenses() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;

  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', note: '' });
  const [revenueForm, setRevenueForm] = useState({ category: '', amount: '', note: '' });

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [exp, rev] = await Promise.all([getExpenses(userId), getRevenues(userId)]);
      setExpenses(exp || []);
      setRevenues(rev || []);
    } catch (err) {
      toast.error('Failed to load financial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalRevenue = revenues.reduce((s, r) => s + (r.amount || 0), 0);
  const net = totalRevenue - totalExpense;

  const chartData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const key = e.category || 'Other';
      map[key] = map[key] || { category: key, expense: 0, revenue: 0 };
      map[key].expense += e.amount || 0;
    });
    revenues.forEach((r) => {
      const key = r.category || 'Other';
      map[key] = map[key] || { category: key, expense: 0, revenue: 0 };
      map[key].revenue += r.amount || 0;
    });
    return Object.values(map);
  }, [expenses, revenues]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.category || !expenseForm.amount) return;
    setSubmitting(true);
    try {
      await addExpense({ userId, ...expenseForm, amount: Number(expenseForm.amount) });
      setExpenseForm({ category: '', amount: '', note: '' });
      toast.success('Expense added.');
      load();
    } catch (err) {
      toast.error('Failed to add expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRevenue = async (e) => {
    e.preventDefault();
    if (!revenueForm.category || !revenueForm.amount) return;
    setSubmitting(true);
    try {
      await addRevenue({ userId, ...revenueForm, amount: Number(revenueForm.amount) });
      setRevenueForm({ category: '', amount: '', note: '' });
      toast.success('Revenue added.');
      load();
    } catch (err) {
      toast.error('Failed to add revenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all expenses and revenues? This cannot be undone.')) return;
    try {
      await clearFinancials(userId);
      toast.success('All records cleared.');
      load();
    } catch (err) {
      toast.error('Failed to clear records.');
    }
  };

  return (
    <div>
      <PageHeading />

      <div className="page-grid-sm" style={{ marginBottom: 24 }}>
        <SummaryCard icon={TrendingUp} label="Total Revenue" value={totalRevenue} color="var(--success)" />
        <SummaryCard icon={TrendingDown} label="Total Expenses" value={totalExpense} color="var(--error)" />
        <SummaryCard
          icon={Wallet}
          label={net >= 0 ? 'Net Profit' : 'Net Loss'}
          value={Math.abs(net)}
          color={net >= 0 ? 'var(--success)' : 'var(--error)'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="expenses-forms-grid">
        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Add Expense</h3>
          <form onSubmit={handleAddExpense}>
            <FormField label="Category" required>
              <Select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Amount (₹)" required>
              <Input
                type="number"
                min="0"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Note">
              <Input
                value={expenseForm.note}
                onChange={(e) => setExpenseForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional note"
              />
            </FormField>
            <Button type="submit" icon={Plus} loading={submitting} fullWidth>
              Add Expense
            </Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Add Revenue</h3>
          <form onSubmit={handleAddRevenue}>
            <FormField label="Category" required>
              <Input
                value={revenueForm.category}
                onChange={(e) => setRevenueForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Crop sale"
                required
              />
            </FormField>
            <FormField label="Amount (₹)" required>
              <Input
                type="number"
                min="0"
                value={revenueForm.amount}
                onChange={(e) => setRevenueForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Note">
              <Input
                value={revenueForm.note}
                onChange={(e) => setRevenueForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional note"
              />
            </FormField>
            <Button type="submit" variant="secondary" icon={Plus} loading={submitting} fullWidth>
              Add Revenue
            </Button>
          </form>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Expenses vs Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}
              />
              <Bar dataKey="revenue" fill="var(--success)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="var(--error)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="expenses-forms-grid">
        <TransactionList title="Recent Expenses" items={expenses} type="expense" loading={loading} />
        <TransactionList title="Recent Revenue" items={revenues} type="revenue" loading={loading} />
      </div>

      {(expenses.length > 0 || revenues.length > 0) && (
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Button variant="danger" size="sm" icon={Trash2} onClick={handleClear}>
            Clear all records
          </Button>
        </div>
      )}
    </div>
  );
}

function PageHeading() {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22 }}>Expenses &amp; Revenue</h2>
      <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Track spending and income to understand your farm's profitability.</p>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={19} style={{ color }} />
        </div>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>{label}</p>
          <p style={{ fontSize: 19, fontWeight: 800, color }}>₹{value.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}

function TransactionList({ title, items, type, loading }) {
  return (
    <Card>
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>{title}</h3>
      {loading ? (
        <Spinner center={false} />
      ) : items.length === 0 ? (
        <EmptyState title="No records yet" description={`Add your first ${type} above.`} />
      ) : (
        <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((it) => (
            <motion.div
              key={it._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                borderLeft: `3px solid ${type === 'expense' ? 'var(--error)' : 'var(--success)'}`,
              }}
            >
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600 }}>{it.category}</p>
                {it.note && <p style={{ fontSize: 12, color: 'var(--muted)' }}>{it.note}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, color: type === 'expense' ? 'var(--error)' : 'var(--success)' }}>
                  ₹{(it.amount || 0).toLocaleString()}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {new Date(it.date).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
