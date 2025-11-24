import WeekGrid from "@/components/WeekGrid";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const weeks = [
    { label: 'This Week', days: ['worked', 'worked', 'missed', 'worked', 'worked', null, null] as Array<'worked' | 'missed' | null>, count: 4 },
    { label: 'Last Week', days: ['worked', 'missed', 'worked', 'worked', 'worked', 'worked', 'missed'] as Array<'worked' | 'missed' | null>, count: 5 },
    { label: '2 Weeks Ago', days: ['worked', 'worked', 'missed', 'missed', 'worked', 'missed', 'missed'] as Array<'worked' | 'missed' | null>, count: 3 },
    { label: '3 Weeks Ago', days: ['worked', 'worked', 'worked', 'worked', 'missed', 'worked', 'worked'] as Array<'worked' | 'missed' | null>, count: 6 },
  ];

  const totalWorkouts = weeks.reduce((sum, week) => sum + week.count, 0);
  const weeksMetGoal = weeks.filter(week => week.count >= 4).length;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          Weekly Summary
        </h1>

        <Card className="rounded-2xl p-6 border-card-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Total Workouts
              </p>
              <p className="text-4xl font-bold text-foreground" data-testid="text-total-workouts">
                {totalWorkouts}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Weeks with Goal Met
              </p>
              <p className="text-4xl font-bold text-primary" data-testid="text-weeks-goal-met">
                {weeksMetGoal}/{weeks.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Current Streak
              </p>
              <p className="text-4xl font-bold text-foreground" data-testid="text-current-streak">
                2 weeks
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Your Workout History
          </h2>
          {weeks.map((week, index) => (
            <WeekGrid
              key={index}
              weekLabel={week.label}
              days={week.days}
              workoutCount={week.count}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
