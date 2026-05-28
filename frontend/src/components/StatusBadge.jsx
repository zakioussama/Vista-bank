const statusStyles = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  rolled_back: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  uploaded: 'bg-slate-100 text-slate-700',
  validated: 'bg-emerald-100 text-emerald-700',
  migrated: 'bg-blue-100 text-blue-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[status] || statusStyles.pending}`}>
    {status?.replace('_', ' ')}
  </span>
);

export default StatusBadge;
