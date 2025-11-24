import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import honeyPot from "@assets/generated_images/honey_pot_icon.png";

interface BuddyCardProps {
  buddyName: string;
  buddyEmail: string;
  potBalance: number;
  weeklyStatus: 'both-on-track' | 'you-behind' | 'they-behind' | 'both-behind';
  avatarUrl?: string;
  onClick?: () => void;
}

export default function BuddyCard({ 
  buddyName, 
  buddyEmail, 
  potBalance, 
  weeklyStatus,
  avatarUrl,
  onClick 
}: BuddyCardProps) {
  const getStatusBadge = () => {
    switch (weeklyStatus) {
      case 'both-on-track':
        return { text: 'Both on track', variant: 'default' as const };
      case 'you-behind':
        return { text: "You're behind", variant: 'destructive' as const };
      case 'they-behind':
        return { text: "They're behind", variant: 'secondary' as const };
      case 'both-behind':
        return { text: 'Both behind', variant: 'outline' as const };
    }
  };

  const status = getStatusBadge();
  const initials = buddyName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card 
      className="rounded-2xl p-5 border-card-border hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-buddy-${buddyName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-12 w-12 ring-2 ring-card-border" data-testid="avatar-buddy">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={buddyName} />}
            <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate" data-testid="text-buddy-name">
              {buddyName}
            </h3>
            <p className="text-sm text-muted-foreground truncate" data-testid="text-buddy-email">
              {buddyEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src={honeyPot} alt="Honey pot" className="w-8 h-8" data-testid="img-honey-pot" />
            <span className="text-2xl font-bold tabular-nums text-foreground" data-testid="text-pot-balance">
              ₹{potBalance}
            </span>
          </div>

          <Badge variant={status.variant} className="whitespace-nowrap" data-testid="badge-status">
            {status.text}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
