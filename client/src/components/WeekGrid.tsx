interface WeekGridProps {
  weekLabel: string;
  days: Array<'worked' | 'missed' | null>;
  workoutCount: number;
  onDayClick?: (dayIndex: number) => void;
}

export default function WeekGrid({ weekLabel, days, workoutCount, onDayClick }: WeekGridProps) {
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
          <button
            key={index}
            onClick={() => onDayClick?.(index)}
            className={`aspect-square rounded-lg flex items-center justify-center border-2 transition-colors cursor-pointer hover-elevate text-lg ${
              status === 'worked'
                ? 'bg-primary/10 border-primary'
                : status === 'missed'
                ? 'bg-destructive/10 border-destructive'
                : 'bg-muted/30 border-muted hover:bg-muted/50'
            }`}
            data-testid={`day-${dayNames[index].toLowerCase()}`}
          >
            {status === 'worked' && <span>💪</span>}
            {status === 'missed' && <span>🧓</span>}
            {!status && <span className="text-xs text-muted-foreground">{dayNames[index]}</span>}
          </button>
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
