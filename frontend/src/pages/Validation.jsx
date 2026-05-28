import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';

const Validation = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    api.get('/files').then((res) => setFiles(res.data.files));
  }, []);

  const runValidation = async () => {
    if (!selectedFile) return toast.error('Select a file first');
    setValidating(true);
    try {
      const { data } = await api.post(`/validation/${selectedFile}`);
      setResult(data);
      toast.success(`Validation complete: ${data.errorCount} errors found`);
      const errRes = await api.get(`/validation/${selectedFile}/errors`);
      setErrors(errRes.data.errors);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const loadErrors = async (fileId) => {
    setLoading(true);
    const { data } = await api.get(`/validation/${fileId}/errors`);
    setErrors(data.errors);
    setLoading(false);
  };

  const errorColumns = [
    { key: 'row_number', label: 'Row #' },
    { key: 'field_name', label: 'Field', render: (r) => r.field_name || 'row' },
    { key: 'error_message', label: 'Error' },
    {
      key: 'row_data',
      label: 'Account / Email',
      render: (r) => {
        const d = r.row_data || {};
        return [d.email, d.account_number].filter(Boolean).join(' · ') || '-';
      },
    },
  ];

  return (
    <MainLayout title="Data Validation">
      <div className="card mb-8">
        <h3 className="mb-4 text-lg font-semibold">Validate Imported Data</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px] flex-1">
            <label className="label">Select File</label>
            <select className="input" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
              <option value="">Choose a file...</option>
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.original_name} ({f.row_count} rows) — {f.status}
                </option>
              ))}
            </select>
          </div>
          <button onClick={runValidation} disabled={validating} className="btn-primary">
            {validating ? 'Validating...' : 'Run Validation'}
          </button>
          {selectedFile && (
            <button onClick={() => loadErrors(selectedFile)} className="btn-secondary">View Saved Errors</button>
          )}
        </div>

        {result && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500">Total Rows</p>
              <p className="text-2xl font-bold">{result.totalRows}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950">
              <p className="text-sm text-emerald-600">Valid Rows</p>
              <p className="text-2xl font-bold text-emerald-700">{result.validRows}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
              <p className="text-sm text-red-600">Errors Found</p>
              <p className="text-2xl font-bold text-red-700">{result.errorCount}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">Validation Errors</h3>
        {loading ? <LoadingSpinner /> : <DataTable columns={errorColumns} data={errors} emptyMessage="No validation errors. Run validation on a file first." />}
      </div>
    </MainLayout>
  );
};

export default Validation;
