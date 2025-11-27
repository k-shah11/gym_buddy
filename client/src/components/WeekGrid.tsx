import { Check, X } from "lucide-react";

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
    <div className="p-4 rounded-2xl border border-card-border bg-card" data-testid="container-week">
      {/* Mobile: stacked layout, Desktop: horizontal layout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Week label and count - side by side on mobile, separate on desktop */}
        <div className="flex items-center justify-between sm:hidden">
          <p className="text-sm font-medium text-muted-foreground" data-testid="text-week-label-mobile">
            {weekLabel}
          </p>
          <div className="flex items-center gap-2">
            <p className={`text-lg font-bold tabular-nums ${metGoal ? 'text-primary' : 'text-muted-foreground'}`} data-testid="text-workout-count-mobile">
              {workoutCount}/7
            </p>
            {metGoal && (
              <span className="text-xs text-primary font-medium" data-testid="text-goal-met-mobile">
                Goal met!
              </span>
            )}
          </div>
        </div>

        {/* Desktop: week label on left */}
        <div className="hidden sm:block w-24 flex-shrink-0">
          <p className="text-sm font-medium text-muted-foreground" data-testid="text-week-label">
            {weekLabel}
          </p>
        </div>

        {/* Days grid */}
        <div className="flex-1 grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((status, index) => (
            <button
              key={index}
              onClick={() => onDayClick?.(index)}
              className={`aspect-square rounded-lg flex items-center justify-center border-2 transition-colors cursor-pointer hover-elevate ${
                status === 'worked'
                  ? 'bg-primary/10 border-primary text-primary'
                  : status === 'missed'
                  ? 'bg-destructive/10 border-destructive text-destructive'
                  : 'bg-muted/30 border-muted hover:bg-muted/50'
              }`}
              data-testid={`day-${dayNames[index].toLowerCase()}`}
            >
              {status === 'worked' && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
              {status === 'missed' && <X className="w-4 h-4 sm:w-5 sm:h-5" />}
              {!status && <span className="text-[10px] sm:text-xs text-muted-foreground">{dayNames[index]}</span>}
            </button>
          ))}
        </div>

        {/* Desktop: count on right */}
        <div className="hidden sm:block w-20 flex-shrink-0 text-right">
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
    </div>
  );
}
