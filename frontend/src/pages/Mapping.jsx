import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { collectSourceColumns, parseColumns } from '../utils/columns';
import { TARGET_FIELDS, VALUE_MAPPING_FIELDS, FIELD_LABELS } from '../constants/bankingFields';

const Mapping = () => {
  const [mappings, setMappings] = useState([]);
  const [targetFields, setTargetFields] = useState(TARGET_FIELDS);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [sourceColumns, setSourceColumns] = useState([]);
  const [valueDefaults, setValueDefaults] = useState({});
  const [form, setForm] = useState({
    name: '',
    description: '',
    mapping_config: {},
    value_mappings: {},
    is_default: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, fRes, tRes, vRes] = await Promise.all([
        api.get('/mappings'),
        api.get('/files'),
        api.get('/mappings/fields'),
        api.get('/mappings/value-defaults'),
      ]);
      setMappings(Array.isArray(mRes.data.mappings) ? mRes.data.mappings : []);
      setFiles(Array.isArray(fRes.data.files) ? fRes.data.files : []);
      setTargetFields(Array.isArray(tRes.data.fields) ? tRes.data.fields : TARGET_FIELDS);
      setValueDefaults(vRes.data.value_mappings || {});
    } catch {
      toast.error('Failed to load mapping data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fileColumns = useMemo(
    () => collectSourceColumns(files, selectedFileId || null),
    [files, selectedFileId]
  );

  const safeSourceColumns = useMemo(() => {
    const merged = [...fileColumns, ...sourceColumns, 'id'];
    return [...new Set(merged.filter(Boolean))];
  }, [fileColumns, sourceColumns]);

  const loadColumnsForFile = async (fileId) => {
    if (!fileId) {
      setSourceColumns(collectSourceColumns(files));
      return;
    }
    try {
      const { data } = await api.get(`/files/${fileId}/columns`);
      setSourceColumns(parseColumns(data.columns));
    } catch {
      const file = files.find((f) => String(f.id) === String(fileId));
      setSourceColumns(parseColumns(file?.columns));
    }
  };

  const openCreate = () => {
    const config = {};
    targetFields.forEach((f) => { config[f] = ''; });
    const firstFileId = files[0]?.id ? String(files[0].id) : '';
    setSelectedFileId(firstFileId);
    setForm({
      name: '',
      description: '',
      mapping_config: config,
      value_mappings: { ...valueDefaults },
      is_default: false,
    });
    setModalOpen(true);
    if (firstFileId) loadColumnsForFile(firstFileId);
  };

  const autoSuggest = async () => {
    if (!selectedFileId) return toast.error('Select a source file first');
    try {
      const { data } = await api.get(`/mappings/suggest/${selectedFileId}`);
      setSourceColumns(parseColumns(data.columns));
      setForm((prev) => ({
        ...prev,
        mapping_config: data.mapping_config || prev.mapping_config,
        value_mappings: data.value_mappings || prev.value_mappings,
      }));
      toast.success('Auto-mapped columns and value transforms applied');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Auto-suggest failed');
    }
  };

  const updateValueMapping = (field, oldCode, newValue) => {
    setForm((prev) => ({
      ...prev,
      value_mappings: {
        ...prev.value_mappings,
        [field]: { ...(prev.value_mappings[field] || {}), [oldCode]: newValue },
      },
    }));
  };

  const handleSave = async () => {
    if (!form.mapping_config?.email) {
      toast.error('Email column mapping is required');
      return;
    }
    if (!form.mapping_config?.account_number) {
      toast.error('Account number column mapping is required');
      return;
    }
    try {
      await api.post('/mappings', form);
      toast.success('Mapping saved');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'is_default', label: 'Default', render: (r) => (r.is_default ? '✓' : '-') },
    { key: 'creator', label: 'Created By', render: (r) => r.creator?.name },
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <MainLayout title="Field Mapping">
      <div className="mb-6 flex justify-between">
        <p className="text-slate-500">Map CSV columns and transform legacy codes (CHK → checking)</p>
        <button type="button" onClick={openCreate} className="btn-primary">Create Mapping</button>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={mappings} emptyMessage="No mappings yet." />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Field Mapping" size="xl">
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Mapping Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Source File</label>
              <select
                className="input"
                value={selectedFileId}
                onChange={(e) => { setSelectedFileId(e.target.value); loadColumnsForFile(e.target.value); }}
              >
                <option value="">All files</option>
                {files.map((f) => <option key={f.id} value={f.id}>{f.original_name}</option>)}
              </select>
            </div>
          </div>
          <button type="button" onClick={autoSuggest} className="btn-secondary text-sm">Auto-suggest from file</button>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-sm font-semibold">Column Mappings (CSV → Platform)</p>
            {targetFields.map((field) => (
              <div key={field} className="mb-2 flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 font-medium text-vista-600">{FIELD_LABELS[field] || field}</span>
                <span>→</span>
                <select
                  className="input flex-1"
                  value={form.mapping_config[field] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    mapping_config: { ...form.mapping_config, [field]: e.target.value },
                  })}
                >
                  <option value="">—</option>
                  {safeSourceColumns.map((col) => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-sm font-semibold">Value Transforms (Old Code → New Value)</p>
            {VALUE_MAPPING_FIELDS.map((field) => (
              <div key={field} className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{FIELD_LABELS[field]}</p>
                {Object.entries(form.value_mappings[field] || {}).slice(0, 8).map(([oldCode, newVal]) => (
                  <div key={`${field}-${oldCode}`} className="mb-1 flex items-center gap-2 text-sm">
                    <input
                      className="input w-24"
                      value={oldCode}
                      onChange={(e) => {
                        const next = { ...(form.value_mappings[field] || {}) };
                        delete next[oldCode];
                        next[e.target.value] = newVal;
                        setForm((prev) => ({
                          ...prev,
                          value_mappings: { ...prev.value_mappings, [field]: next },
                        }));
                      }}
                    />
                    <span>→</span>
                    <input
                      className="input flex-1"
                      value={newVal}
                      onChange={(e) => updateValueMapping(field, oldCode, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            <span className="text-sm">Set as default</span>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-3 border-t pt-4">
          <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button type="button" onClick={handleSave} className="btn-primary">Save Mapping</button>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Mapping;
