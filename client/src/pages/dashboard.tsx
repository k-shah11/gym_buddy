import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import WeekGrid from "@/components/WeekGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Workout } from "@shared/schema";

interface WeekData {
  weekStartDate: string;
  workouts: Workout[];
  workoutCount: number;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<{ weekStart: string; dayIndex: number } | null>(null);

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

  // Log workout mutation
  const logWorkoutMutation = useMutation({
    mutationFn: async ({ date, worked }: { date: string; worked: boolean }) => {
      return await apiRequest('POST', '/api/workouts', {
        date,
        status: worked ? 'worked' : 'missed',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
      setSelectedDay(null);
      toast({ title: "Workout logged successfully" });
    },
    onError: () => {
      toast({ title: "Failed to log workout", variant: "destructive" });
    },
  });

  // Helper to get day of week (0 = Monday, 6 = Sunday)
  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
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

  // Get date for a given day in week
  const getDateForDay = (weekStartDate: string, dayIndex: number) => {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split('T')[0];
  };

  // Get current status for selected day
  const getSelectedDayStatus = () => {
    if (!selectedDay) return null;
    const week = weeksData.find(w => w.weekStartDate === selectedDay.weekStart);
    if (!week) return null;
    return getWeekDays(week)[selectedDay.dayIndex];
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
                onDayClick={(dayIndex) => setSelectedDay({ weekStart: week.weekStartDate, dayIndex })}
              />
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && (() => {
                const date = getDateForDay(selectedDay.weekStart, selectedDay.dayIndex);
                return `Log workout for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
              })()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Current status: {getSelectedDayStatus() ? (getSelectedDayStatus() === 'worked' ? 'Worked out' : 'Missed') : 'Not logged'}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedDay) {
                  const date = getDateForDay(selectedDay.weekStart, selectedDay.dayIndex);
                  logWorkoutMutation.mutate({ date, worked: true });
                }
              }}
              disabled={logWorkoutMutation.isPending}
              data-testid="button-log-worked"
            >
              {logWorkoutMutation.isPending ? "Logging..." : "Logged Workout"}
            </Button>
            <Button
              onClick={() => {
                if (selectedDay) {
                  const date = getDateForDay(selectedDay.weekStart, selectedDay.dayIndex);
                  logWorkoutMutation.mutate({ date, worked: false });
                }
              }}
              disabled={logWorkoutMutation.isPending}
              data-testid="button-log-missed"
            >
              {logWorkoutMutation.isPending ? "Logging..." : "Missed Workout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
