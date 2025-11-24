import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import BuddyCard from "@/components/BuddyCard";
import AddBuddyDialog from "@/components/AddBuddyDialog";
import StatsCard from "@/components/StatsCard";
import { Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Buddy {
  pairId: string;
  buddy: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  potBalance: number;
}

export default function BuddiesPage() {
  const { toast } = useToast();

  // Fetch buddies
  const { data: buddies = [], isLoading } = useQuery<Buddy[]>({
    queryKey: ['/api/buddies'],
  });

  // Add buddy mutation
  const addBuddyMutation = useMutation({
    mutationFn: async ({ email, name }: { email: string; name: string }) => {
      return await apiRequest('/api/buddies', 'POST', { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success!",
        description: "Buddy added successfully",
      });
    },
    onError: (error: any) => {
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
        description: error.message || "Failed to add buddy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddBuddy = (email: string, name: string) => {
    addBuddyMutation.mutate({ email, name });
  };

  const totalPots = buddies.reduce((sum, buddy) => sum + buddy.potBalance, 0);

  // Get weekly status (simplified for now - would need more data from backend)
  const getWeeklyStatus = () => 'both-on-track' as const;

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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Gym Buddies
          </h1>
          <AddBuddyDialog onAddBuddy={handleAddBuddy} />
        </div>

        <StatsCard
          label="Total Active Pots"
          value={`₹${totalPots}`}
          icon={<Coins className="w-6 h-6" />}
        />

        {buddies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              You haven't added any gym buddies yet!
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Add Buddy" above to start competing with friends.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {buddies.map((buddy) => (
              <BuddyCard
                key={buddy.pairId}
                buddyName={buddy.buddy.name}
                buddyEmail={buddy.buddy.email}
                potBalance={buddy.potBalance}
                weeklyStatus={getWeeklyStatus()}
                avatarUrl={buddy.buddy.profileImageUrl}
                onClick={() => console.log('Clicked:', buddy.buddy.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
