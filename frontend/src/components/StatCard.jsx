const StatCard = ({ title, value, subtitle, icon, color = 'vista' }) => {
  const colors = {
    vista: 'bg-vista-50 text-vista-700 dark:bg-vista-950 dark:text-vista-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`rounded-lg p-3 ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
