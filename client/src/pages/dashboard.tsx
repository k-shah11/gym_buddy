import { useQuery } from "@tanstack/react-query";
import WeekGrid from "@/components/WeekGrid";
import { Card } from "@/components/ui/card";
import type { Workout } from "@shared/schema";

interface WeekData {
  weekStartDate: string;
  workouts: Workout[];
  workoutCount: number;
}

export default function DashboardPage() {
  // Fetch workout history
  const { data: weeksData = [], isLoading } = useQuery<WeekData[]>({
    queryKey: ['/api/workouts/history'],
    queryFn: async () => {
      const response = await fetch('/api/workouts/history?weeks=4', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch workout history');
      return response.json();
    },
  });

  // Helper to get day of week (0 = Monday, 6 = Sunday)
  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday from 0 to 6, shift others down
  };

  // Convert workouts to 7-day array
  const getWeekDays = (weekData: WeekData): Array<'worked' | 'missed' | null> => {
    const days: Array<'worked' | 'missed' | null> = [null, null, null, null, null, null, null];
    
    weekData.workouts.forEach(workout => {
      const dayIndex = getDayOfWeek(workout.date);
      days[dayIndex] = workout.status;
    });
    
    return days;
  };

  // Get week label
  const getWeekLabel = (weekStartDate: string, index: number) => {
    if (index === 0) return 'This Week';
    if (index === 1) return 'Last Week';
    return `${index + 1} Weeks Ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalWorkouts = weeksData.reduce((sum, week) => sum + week.workoutCount, 0);
  const weeksMetGoal = weeksData.filter(week => week.workoutCount >= 4).length;
  const currentStreak = weeksData[0]?.workoutCount >= 4 && weeksData[1]?.workoutCount >= 4 ? '2+ weeks' : 
                       weeksData[0]?.workoutCount >= 4 ? '1 week' : '0 weeks';

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
                {weeksMetGoal}/{weeksData.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Current Streak
              </p>
              <p className="text-4xl font-bold text-foreground" data-testid="text-current-streak">
                {currentStreak}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Your Workout History
          </h2>
          {weeksData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No workout data yet. Start logging your workouts!
              </p>
            </div>
          ) : (
            weeksData.map((week, index) => (
              <WeekGrid
                key={week.weekStartDate}
                weekLabel={getWeekLabel(week.weekStartDate, index)}
                days={getWeekDays(week)}
                workoutCount={week.workoutCount}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
