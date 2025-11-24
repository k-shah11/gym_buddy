import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import BuddyCard from "@/components/BuddyCard";
import AddBuddyDialog from "@/components/AddBuddyDialog";
import StatsCard from "@/components/StatsCard";
import { Coins, Mail, Check, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  // Fetch pending invitations sent by user
  const { data: sentInvitations = [] } = useQuery<any[]>({
    queryKey: ['/api/invitations/pending'],
  });

  // Fetch invitations received by user
  const { data: receivedInvitations = [] } = useQuery<any[]>({
    queryKey: ['/api/invitations/received'],
  });

  // Add buddy mutation
  const addBuddyMutation = useMutation({
    mutationFn: async ({ email, name }: { email: string; name: string }) => {
      return await apiRequest('POST', '/api/buddies', { email });
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

  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await apiRequest('POST', `/api/invitations/${invitationId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invitations/received'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success!",
        description: "Invitation accepted! You are now buddies.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    },
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await apiRequest('DELETE', `/api/invitations/${invitationId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invitations/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invitations/received'] });
      toast({
        title: "Deleted",
        description: "Invitation removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    },
  });

  const handleAddBuddy = (email: string, name: string) => {
    addBuddyMutation.mutate({ email, name });
  };

  const handleAcceptInvitation = (invitationId: string) => {
    acceptInvitationMutation.mutate(invitationId);
  };

  const handleDeleteInvitation = (invitationId: string) => {
    deleteInvitationMutation.mutate(invitationId);
  };

  const recalcPosMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/pots/recalculate', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buddies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success!",
        description: "Pots recalculated based on your actual workout history",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to recalculate pots",
        variant: "destructive",
      });
    },
  });

  const totalPots = buddies.reduce((sum, buddy) => sum + buddy.potBalance, 0);

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => recalcPosMutation.mutate()}
              disabled={recalcPosMutation.isPending}
              data-testid="button-recalculate-pots"
              title="Recalculate pot amounts based on actual workout history"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Pots
            </Button>
            <AddBuddyDialog onAddBuddy={handleAddBuddy} />
          </div>
        </div>

        <StatsCard
          label="Total Active Pots"
          value={`₹${totalPots}`}
          icon={<Coins className="w-6 h-6" />}
        />

        {receivedInvitations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Invitations</h2>
            {receivedInvitations.map((invitation) => (
              <Card key={invitation.id} className="rounded-2xl p-4 border-card-border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{invitation.inviter.email}</p>
                    <p className="text-sm text-muted-foreground">wants you as a gym buddy</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={acceptInvitationMutation.isPending || deleteInvitationMutation.isPending}
                      className="hover-elevate active-elevate-2"
                      data-testid="button-accept-invitation"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      disabled={deleteInvitationMutation.isPending}
                      className="text-destructive hover:text-destructive hover-elevate active-elevate-2"
                      data-testid="button-delete-received-invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {sentInvitations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Invitations Sent</h2>
            {sentInvitations.map((invitation) => (
              <Card key={invitation.id} className="rounded-2xl p-4 border-card-border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{invitation.inviteeEmail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {invitation.invitee ? "Signed up • Awaiting acceptance" : "Invitation sent"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="whitespace-nowrap">
                      Pending
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      disabled={deleteInvitationMutation.isPending}
                      className="text-destructive hover:text-destructive hover-elevate active-elevate-2"
                      data-testid="button-delete-sent-invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {buddies.length === 0 && receivedInvitations.length === 0 && sentInvitations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              You haven't added any gym buddies yet!
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Add Buddy" above to start competing with friends.
            </p>
          </div>
        ) : (
          buddies.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Active Buddies</h2>
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
          )
        )}
      </div>
    </div>
  );
}
