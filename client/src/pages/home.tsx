import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import DailySwipeCard from "@/components/DailySwipeCard";
import StatsCard from "@/components/StatsCard";
import { Users, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Workout } from "@shared/schema";

export default function HomePage() {
  const { toast } = useToast();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Fetch today's workout
  const { data: todayWorkout, isLoading: workoutLoading } = useQuery<Workout | null>({
    queryKey: ['/api/workouts/today'],
  });

  // Fetch stats
  const { data: stats } = useQuery<{ buddyCount: number; totalPots: number }>({
    queryKey: ['/api/stats'],
  });

  // Log workout mutation
  const logWorkoutMutation = useMutation({
    mutationFn: async (worked: boolean) => {
      return await apiRequest('/api/workouts', 'POST', {
        status: worked ? 'worked' : 'missed',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Run weekly evaluation on mount
  useEffect(() => {
    const evaluateWeeks = async () => {
      try {
        await apiRequest('/api/evaluate-weeks', 'POST', {});
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
      } catch (error) {
        console.error('Failed to evaluate weeks:', error);
      }
    };
    
    evaluateWeeks();
  }, []);

  const handleSwipe = (worked: boolean) => {
    logWorkoutMutation.mutate(worked);
  };

  if (workoutLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <DailySwipeCard 
          date={today}
          onSwipe={handleSwipe}
          initialStatus={todayWorkout?.status || null}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            label="Gym Buddies"
            value={stats?.buddyCount ?? 0}
            icon={<Users className="w-6 h-6" />}
          />
          <StatsCard
            label="Total in Pots"
            value={`₹${stats?.totalPots ?? 0}`}
            icon={<Coins className="w-6 h-6" />}
          />
        </div>
      </div>
    </div>
  );
}
