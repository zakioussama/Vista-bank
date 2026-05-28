import StatusBadge from './StatusBadge';
import { PREVIEW_DISPLAY_FIELDS, FIELD_LABELS } from '../constants/bankingFields';

const MigrationPreviewTable = ({ preview = [] }) => {
  if (!preview.length) {
    return <p className="text-sm text-slate-500">No preview rows available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-xs dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Row</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Status</th>
            {PREVIEW_DISPLAY_FIELDS.map((f) => (
              <th key={f} className="px-3 py-2 text-left font-semibold text-slate-500">{FIELD_LABELS[f]}</th>
            ))}
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Errors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {preview.map((row) => (
            <tr key={row.row_number} className={row.valid ? '' : 'bg-red-50/50 dark:bg-red-950/20'}>
              <td className="px-3 py-2">{row.row_number}</td>
              <td className="px-3 py-2">
                <StatusBadge status={row.valid ? 'success' : 'error'} />
              </td>
              {PREVIEW_DISPLAY_FIELDS.map((f) => (
                <td key={f} className="px-3 py-2">
                  <div className="text-slate-400 line-through">{String(row.original?.[f] ?? row.original?.[f === 'legacy_id' ? 'id' : ''] ?? '-')}</div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">{String(row.transformed?.[f] ?? '-')}</div>
                </td>
              ))}
              <td className="max-w-xs px-3 py-2 text-red-600">{row.errors?.join('; ') || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MigrationPreviewTable;
