import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const PIE_COLORS = ['#0c87e9', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#64748b'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <MainLayout title="Dashboard"><LoadingSpinner /></MainLayout>;

  const { stats, recentMigrations } = data;

  const migrationColumns = [
    { key: 'name', label: 'Migration' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'success_count', label: 'Success' },
    { key: 'failed_count', label: 'Failed' },
    { key: 'report', label: 'Duration', render: (r) => r.report?.durationFormatted || '-' },
    { key: 'operator', label: 'Operator', render: (r) => r.operator?.name || '-' },
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Migrations" value={stats.totalMigrations} color="vista" icon={<span className="text-xl">📊</span>} />
        <StatCard title="Successful Records" value={stats.totalSuccess.toLocaleString()} color="green" icon={<span className="text-xl">✓</span>} />
        <StatCard title="Failed Records" value={stats.totalFailed.toLocaleString()} color="red" icon={<span className="text-xl">✗</span>} />
        <StatCard title="Account Errors" value={(stats.totalAccountErrors || 0).toLocaleString()} color="amber" subtitle="Account field validation" icon={<span className="text-xl">⚠</span>} />
        <StatCard title="Running Now" value={stats.runningMigrations} color="vista" icon={<span className="text-xl">⟳</span>} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Monthly Migration Stats</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.monthlyStats || []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="success" fill="#10b981" name="Success" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.statusBreakdown || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status}: ${count}`}>
                {(stats.statusBreakdown || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-8">
        <h3 className="mb-4 text-lg font-semibold">Recent Migration History</h3>
        <DataTable columns={migrationColumns} data={recentMigrations} emptyMessage="No migrations yet" />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
