import { useEffect, useState } from 'react';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, level: '', action: '', search: '' });

  const fetchLogs = () => {
    setLoading(true);
    api.get('/logs', { params: filters })
      .then((res) => {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [filters.page, filters.level, filters.action]);

  const columns = [
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleString() },
    { key: 'level', label: 'Level', render: (r) => <StatusBadge status={r.level} /> },
    { key: 'action', label: 'Action' },
    { key: 'message', label: 'Message' },
    { key: 'user', label: 'User', render: (r) => r.user?.name || 'System' },
    { key: 'migration', label: 'Migration', render: (r) => r.migration?.name || '-' },
  ];

  return (
    <MainLayout title="System Logs">
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            className="input max-w-xs"
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
          />
          <select className="input max-w-[160px]" value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}>
            <option value="">All levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>
          <select className="input max-w-[180px]" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}>
            <option value="">All actions</option>
            <option value="validation">Validation</option>
            <option value="migration_completed">Migration completed</option>
            <option value="migration_failed">Migration failed</option>
            <option value="file_upload">File upload</option>
          </select>
          <button onClick={fetchLogs} className="btn-primary">Search</button>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : (
          <>
            <DataTable columns={columns} data={logs} />
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} logs)</p>
                <div className="flex gap-2">
                  <button disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="btn-secondary">Previous</button>
                  <button disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="btn-secondary">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Logs;
