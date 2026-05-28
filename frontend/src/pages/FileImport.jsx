import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const FileImport = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchFiles = () => {
    api.get('/files').then((res) => setFiles(res.data.files)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchFiles(); }, []);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Uploaded ${data.file.original_name} (${data.file.row_count} rows)`);
      setPreview(data.preview);
      fetchFiles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const viewPreview = async (id) => {
    const { data } = await api.get(`/files/${id}`);
    setPreview(data.preview);
  };

  const columns = [
    { key: 'original_name', label: 'File Name' },
    { key: 'row_count', label: 'Rows' },
    { key: 'size', label: 'Size', render: (r) => `${(r.size / 1024).toFixed(1)} KB` },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'uploader', label: 'Uploaded By', render: (r) => r.uploader?.name },
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleString() },
    { key: 'actions', label: '', render: (r) => (
      <button onClick={() => viewPreview(r.id)} className="text-sm text-vista-600 hover:underline">Preview</button>
    )},
  ];

  const previewCols = preview?.length
    ? Object.keys(preview[0]).map((k) => ({ key: k, label: k }))
    : [];

  return (
    <MainLayout title="File Import">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`card mb-8 border-2 border-dashed transition ${dragOver ? 'border-vista-500 bg-vista-50 dark:bg-vista-950' : 'border-slate-300'}`}
      >
        <div className="flex flex-col items-center py-12">
          <svg className="mb-4 h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium">Drag & drop CSV or Excel files here</p>
          <p className="mt-1 text-sm text-slate-500">or click to browse (max 10MB)</p>
          <label className="btn-primary mt-4 cursor-pointer">
            {uploading ? 'Uploading...' : 'Browse Files'}
            <input type="file" accept=".csv,.xls,.xlsx" className="hidden" disabled={uploading}
              onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])} />
          </label>
        </div>
      </div>

      {preview && (
        <div className="card mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Data Preview</h3>
            <button onClick={() => setPreview(null)} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
          </div>
          <DataTable columns={previewCols} data={preview} />
        </div>
      )}

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">Uploaded Files</h3>
        {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={files} />}
      </div>
    </MainLayout>
  );
};

export default FileImport;
