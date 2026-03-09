'use client';

interface SeverityBarProps {
  severity: number;
}

export default function SeverityBar({ severity }: SeverityBarProps) {
  const percentage = Math.round(severity * 100);

  const getSeverityColor = (sev: number) => {
    if (sev < 0.33) return 'bg-emerald-500';
    if (sev < 0.66) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSeverityLabel = (sev: number) => {
    if (sev < 0.33) return 'Low';
    if (sev < 0.66) return 'Moderate';
    return 'High';
  };

  const getSeverityTextColor = (sev: number) => {
    if (sev < 0.33) return 'text-emerald-400';
    if (sev < 0.66) return 'text-amber-400';
    return 'text-red-400';
  };

  const colorClass = getSeverityColor(severity);
  const label = getSeverityLabel(severity);
  const textColor = getSeverityTextColor(severity);

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Severity
        </span>
        <span className={`text-sm font-mono font-bold ${textColor}`}>
          {label} · {percentage}%
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        Detected degradation level
      </p>
    </div>
  );
}
