'use client';

interface ConfidenceBarProps {
  confidence: number;
}

export default function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const percentage = Math.round(confidence * 100);

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Confidence
        </span>
        <span className="text-sm font-mono font-bold text-foreground">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        Model prediction certainty
      </p>
    </div>
  );
}
