import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import MigrationPreviewTable from '../components/MigrationPreviewTable';

const Migrations = () => {
  const [migrations, setMigrations] = useState([]);
  const [files, setFiles] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedMigration, setSelectedMigration] = useState(null);
  const [form, setForm] = useState({ name: '', file_id: '', mapping_id: '' });

  const fetchAll = async () => {
    const [mRes, fRes, mapRes] = await Promise.all([
      api.get('/migrations'),
      api.get('/files'),
      api.get('/mappings'),
    ]);
    setMigrations(mRes.data.migrations);
    setFiles(fRes.data.files.filter((f) => ['validated', 'uploaded'].includes(f.status)));
    setMappings(mapRes.data.mappings);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      api.get('/migrations').then((res) => setMigrations(res.data.migrations));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const runPreview = async () => {
    if (!form.file_id || !form.mapping_id) return toast.error('Select file and mapping first');
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const { data } = await api.post('/migrations/preview', {
        file_id: form.file_id,
        mapping_id: form.mapping_id,
        limit: 20,
      });
      setPreviewData(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Preview failed');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const createMigration = async () => {
    try {
      await api.post('/migrations', form);
      toast.success('Migration created');
      setModalOpen(false);
      setPreviewOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const startMigration = async (id) => {
    try {
      await api.post(`/migrations/${id}/start`);
      toast.success('Migration started');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start');
    }
  };

  const cancelMigration = async (id) => {
    await api.post(`/migrations/${id}/cancel`);
    toast.success('Cancellation requested');
    fetchAll();
  };

  const rollbackMigration = async (id) => {
    if (!confirm('Rollback will remove all migrated records. Continue?')) return;
    await api.post(`/migrations/${id}/rollback`);
    toast.success('Migration rolled back');
    fetchAll();
  };

  const columns = [
    { key: 'name', label: 'Migration' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'progress', label: 'Progress', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-vista-600" style={{ width: `${r.progress}%` }} />
        </div>
        <span className="text-xs">{r.progress}%</span>
      </div>
    )},
    { key: 'success_count', label: 'Success' },
    { key: 'failed_count', label: 'Failed' },
    { key: 'report', label: 'Duration', render: (r) => r.report?.durationFormatted || '-' },
    { key: 'file', label: 'File', render: (r) => r.file?.original_name || '-' },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex flex-wrap gap-2">
        {r.report && (
          <button type="button" onClick={() => { setSelectedMigration(r); setReportOpen(true); }} className="text-xs text-vista-600 hover:underline">Report</button>
        )}
        {['pending', 'failed', 'cancelled'].includes(r.status) && (
          <button type="button" onClick={() => startMigration(r.id)} className="text-xs text-vista-600 hover:underline">Start</button>
        )}
        {r.status === 'running' && (
          <button type="button" onClick={() => cancelMigration(r.id)} className="text-xs text-amber-600 hover:underline">Cancel</button>
        )}
        {r.status === 'completed' && (
          <button type="button" onClick={() => rollbackMigration(r.id)} className="text-xs text-red-600 hover:underline">Rollback</button>
        )}
      </div>
    )},
  ];

  return (
    <MainLayout title="Migrations">
      <div className="mb-6 flex justify-between">
        <p className="text-slate-500">Preview transformations, then launch migrations</p>
        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">New Migration</button>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={migrations} />}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Migration" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Migration Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Source File</label>
            <select className="input" value={form.file_id} onChange={(e) => setForm({ ...form, file_id: e.target.value })}>
              <option value="">Select file...</option>
              {files.map((f) => <option key={f.id} value={f.id}>{f.original_name} ({f.status})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Field Mapping</label>
            <select className="input" value={form.mapping_id} onChange={(e) => setForm({ ...form, mapping_id: e.target.value })}>
              <option value="">Select mapping...</option>
              {mappings.map((m) => <option key={m.id} value={m.id}>{m.name}{m.is_default ? ' (default)' : ''}</option>)}
            </select>
          </div>
          <button type="button" onClick={runPreview} className="btn-secondary w-full">Preview Transformation</button>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="button" onClick={createMigration} className="btn-primary">Create</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Migration Preview" size="xl">
        {previewLoading ? <LoadingSpinner /> : previewData && (
          <>
            <div className="mb-4 flex gap-4 text-sm">
              <span>Total rows: <strong>{previewData.totalRows}</strong></span>
              <span className="text-emerald-600">Valid in preview: {previewData.validCount}</span>
              <span className="text-red-600">Invalid in preview: {previewData.invalidCount}</span>
            </div>
            <MigrationPreviewTable preview={previewData.preview} />
          </>
        )}
      </Modal>

      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Migration Report" size="md">
        {selectedMigration?.report && (
          <div className="space-y-3 text-sm">
            <p><strong>Total:</strong> {selectedMigration.report.total}</p>
            <p><strong>Successful:</strong> {selectedMigration.report.success}</p>
            <p><strong>Failed:</strong> {selectedMigration.report.failed}</p>
            <p><strong>Duration:</strong> {selectedMigration.report.durationFormatted}</p>
            <p><strong>Account-related errors:</strong> {selectedMigration.report.accountErrors ?? 0}</p>
            {selectedMigration.report.failedSample?.length > 0 && (
              <div>
                <p className="mb-2 font-semibold">Failure samples</p>
                <ul className="max-h-48 overflow-y-auto rounded border p-2 text-xs">
                  {selectedMigration.report.failedSample.map((f) => (
                    <li key={f.row} className="mb-1">Row {f.row}: {f.errors.join('; ')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default Migrations;
