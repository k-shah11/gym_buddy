import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card className="rounded-2xl p-4 border-card-border" data-testid="card-stat">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1" data-testid="text-stat-label">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground" data-testid="text-stat-value">
            {value}
          </p>
        </div>
        {icon && (
          <div className="text-primary" data-testid="icon-stat">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
