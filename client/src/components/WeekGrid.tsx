import { Check, X } from "lucide-react";

interface WeekGridProps {
  weekLabel: string;
  days: Array<'worked' | 'missed' | null>;
  workoutCount: number;
}

export default function WeekGrid({ weekLabel, days, workoutCount }: WeekGridProps) {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const metGoal = workoutCount >= 4;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-card-border bg-card" data-testid="container-week">
      <div className="w-24 flex-shrink-0">
        <p className="text-sm font-medium text-muted-foreground" data-testid="text-week-label">
          {weekLabel}
        </p>
      </div>

      <div className="flex-1 grid grid-cols-7 gap-2">
        {days.map((status, index) => (
          <div
            key={index}
            className={`aspect-square rounded-lg flex items-center justify-center border-2 transition-colors ${
              status === 'worked'
                ? 'bg-primary/10 border-primary text-primary'
                : status === 'missed'
                ? 'bg-destructive/10 border-destructive text-destructive'
                : 'bg-muted/30 border-muted'
            }`}
            data-testid={`day-${dayNames[index].toLowerCase()}`}
          >
            {status === 'worked' && <Check className="w-5 h-5" />}
            {status === 'missed' && <X className="w-5 h-5" />}
            {!status && <span className="text-xs text-muted-foreground">{dayNames[index]}</span>}
          </div>
        ))}
      </div>

      <div className="w-20 flex-shrink-0 text-right">
        <p className={`text-lg font-bold tabular-nums ${metGoal ? 'text-primary' : 'text-muted-foreground'}`} data-testid="text-workout-count">
          {workoutCount}/7
        </p>
        {metGoal && (
          <p className="text-xs text-primary font-medium" data-testid="text-goal-met">
            Goal met!
          </p>
        )}
      </div>
    </div>
  );
}
